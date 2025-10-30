// EDGAR Feeds Downloaded 
// can extract SGMl and JSON metadata and filing files
// processing time = 1-2 minute per daily archive
// run in screen:   
// screen -S edgarFeedsDownloader -L -Logfile /data/edgarFeedsDownloader.log node edgarFeedsDownloader.mjs

import { common } from '../server/common.mjs';
import { config } from '../server/config.mjs';
import { exec, fork } from 'child_process';
//import { promisify } from 'util';
import fs from 'fs';
//import { processFeedFile } from './edgarFeedFileProcessor.mjs';

const FEED_PROCESS_FILE = './edgarFeedFileProcessor.mjs';
//const execAsync = promisify(exec);

// Configuration
const debugAdsh = false;  //if a string (truthy) is provided, only process a source filenames containing this string, leaving sourcing files for inspection:  if false, process all
const processControl = {
    useExistingFiles: false,
    debugAdsh: debugAdsh,
    leaveSourceFiles: true || debugAdsh,
    writeExtractedFiles: false,
    extractedFilesBucket: "test.publicdata.guru",
    extractedFilesPrefix: "EdgarFileSystem/PublicFilings/",
    writeSgmlMetaDataFiles: true,
    writeJsonMetaDataFiles: true,
    maxQueuedDownloads: 2,  //at 1GB per tar.gz file (expanding to 10GB) and 20 seconds to download, 10s timer stay well below SEC.gov 10 requests per second limit and does not occupy too much disk space
    maxFileIngests: 5,  //internal processes to ingest local files leveraging Node's non-blocking model
    maxRetries: 3,
    submissionProcessTimout: 2*60*1000,  //1 minutes for one .nc file (10 mintues when debugging)
    downloadProcessTimout: 15*60*1000,  //10 minutes for one gz archive (some current archives are 8GB compressed)
    retries: {},  // record of retried archive downloads / unzips
    start: new Date("2024-01-02"),  //restart date.  If none, the lesser of the max(filedt) and 2008-01-01 is used
    end: new Date("2024-03-31"),  //if false or not set, scrape continues up to today
    days: [
    ], //ingest specific days (also used as retry queue) e.g. ['2013-08-12', '2013-08-14', '2013-11-13', '2013-11-15', '2014-03-04', '2014-08-04', '2014-11-14', '2015-03-31','2015-04-30', '2016-02-18', '2016-02-26', '2016-02-29', '2017-02-24', '2017-02-28', '2017-04-27','2017-05-10', '2017-08-03', '2017-08-04', '2017-08-08', '2017-10-16', '2017-10-23', '2017-10-30', '2017-11-03','2017-11-06', '2017-12-20', '2018-04-26', '2018-04-27', '2018-04-30', '2018-05-01', '2018-11-14']],
    processes: {},
    activeDownloads: {},
    feedsDir: '/data/feeds/', //data is mounted to 108GB SSD for mgd6.large 
    filingsDir: '/data/filings/', //mounted to 108GB SSD for mgd6.large:  filings will be written to subfolder path "${filerCik}/${filerAdsh}/" in this directory
};
 

(async function (){  //entry point of this program
    //Unzipping occurs on local drive using instances with local SSDs (=75 GB for rd5.large), therefore...
    // 1. format and mount local SSD drive as /data directory (note:  this should already be done in  ~/.bash_profile.)
    await asyncExec("sudo mkfs -t xfs /dev/nvme1n1");
    await asyncExec("sudo mkdir -p -m 777 /data"); 
    await asyncExec("sudo mount /dev/nvme1n1 /data");
    await asyncExec("sudo chmod 777 /data");
    await asyncExec("sudo mkdir -p -m 777 " + processControl.feedsDir); //write the feed tar-balls and expand them in date subdirs

    //initialize process counts
    processControl.dailyArchivesProcessed = 0;
    processControl.activeDownloads = {}; //clear references to activeDownloads
    processControl.downloadCount = 0;
    processControl.downloadFailCount = 0;
    processControl.killedProcessCount = 0;
    processControl.untarFailures = 0;
    processControl.processedCount = {};
    processControl.dailyArchivesSubmittedForRetry = 0;
    processControl.total345SubmissionsProcessed = 0;
    processControl.totalSubmissionsProcessed = 0;
    processControl.largeUnreadFileCount = 0;
    processControl.totalGBytesDownloaded = 0;
    processControl.processedByteCount = 0;
    processControl.processedDocumentCount = 0;
    processControl.paths = {}; //distinct SGL property paths and max use of each path within a single submission

    //2. clear the any remains from the last feeds processing in the feeds directory
    if(!processControl.useExistingFiles) {
        await asyncExec('rm -r ' + processControl.feedsDir + '*'); 
        await asyncExec("sudo mkdir -p -m 777 " + processControl.filingsDir);   //write the extracted SGML feed here

        //4. start the download manager
        startDownloadManager(processControl, function () {
            //this callback is fired when download manager is completely down with all downloads
            console.log('Feeds downloader processing finished', JSON.stringify(processControl));
            
            // Close all database connection pools before exiting
            common.closeAllPools().then(() => {
                console.log('Database connection pools closed');
                process.exit();  //exit point of this program
            }).catch(error => {
                console.error('Error closing database pools:', error);
                process.exit(1);
            });
        });
    } else {
        processControl.activeDownloads.d1 = {
            status: 'unarchived',
            archiveDate: processControl.start,
            archiveName: processControl.start.toISOString().substring(0, 10).replace(/-/g, ''),
            url: "https://www.sec.gov/Archives/edgar/Feed/2024/QTR1/20240408.nc.tar.gz",
            timeStamp: Date.now()
        };
        indexDirectory(processControl, 1, ()=>{
            common.closeAllPools().then(()=>{process.exit();});
        });
    }
   
})();

async function startDownloadManager(processControl, startDownloadManagerCallback) { //body of program (called only once)
    var ingestingFlag = false;  //important state flag must be set at start of ingest and cleared when finished
    var tick = 0;
    var downloadOverSeer;
    downloadOverSeer = setInterval(overseeDownloads, 1000);  //master event loop kicks off, queues, and monitors downloads and manages uncompressed and file deletions

    function overseeDownloads() {
        let downloadDate, d;
        //1. check for available process slots and (and restart dead activeDownloads)
        tick++;
        if(tick/(30*60) == Math.floor(tick/(30*60))) console.log(processControl);  //write status every 5 minutes to console
        let downloadingCount = 0;
        for (d = 1; d <= processControl.maxQueuedDownloads; d++) {
            if (!processControl.activeDownloads["d" + d]  || processControl.activeDownloads["d" + d].status=='504'
                || processControl.activeDownloads["d" + d].status=='untar error' || processControl.activeDownloads["d" + d].status=='download error') { //start new download process
                downloadDate = nextWeekday();
                if(downloadDate) {
                    //console.log(downloadDate);
                    downloadingCount++;
                    downloadAndUntarDailyArchive(d, downloadDate, function(downloadControl){//callback invoked by "downloadDailyArchiveCallback" in subroutine
                        if(downloadControl.status=='untar error' || downloadControl.status=='download error'){
                            addDayToReprocess(downloadControl.archiveDate, downloadControl.status);  //requeue for up to 3 retries
                            if(processControl.activeDownloads["d" + downloadControl.d] && downloadControl.ts == processControl.activeDownloads["d" + downloadControl.d].ts){
                                delete processControl.activeDownloads["d" + downloadControl.d]; //open download process slot
                            }
                        }
                    });
                    break;  //only one download every 100ms (inteval timer is 1000ms)                
                }
            } else {  //check health
                downloadingCount++;
                var runTime = Date.now() - processControl.activeDownloads["d" + d].timeStamp;
                var status = processControl.activeDownloads["d" + d].status;
                if ((runTime > processControl.downloadProcessTimout) && (status == 'downloading' || status == 'unarchiving')) { // > 10 minutes for one gz archive
                    console.log(`${(new Date()).toISOString().substring(11, 19)}: killing long '${status} process`, processControl.activeDownloads["d" + d].url);
                    addDayToReprocess(processControl.activeDownloads["d" + d].archiveDate, processControl.activeDownloads["d" + d].status);
                    delete processControl.activeDownloads["d" + d];  //if process actually returns, it will gracefully end without proper control reference
                    processControl.killedProcessCount++;  //will be restarted on next timer tick
                } else {
                    if(!ingestingFlag && processControl.activeDownloads["d" + d].status == 'unarchived'){ //only index one directory at a time
                        ingestingFlag = true;
                        indexDirectory(processControl, d, function(downloadControl){
                            //this callback invoked when indexDirectory has completely index the directory or errored out
                            switch(downloadControl.status){
                                case("ingested"):
                                    processControl.dailyArchivesProcessed++
                            }
                            delete processControl.activeDownloads["d" + downloadControl.d];  //next download or inject starts on next tick
                            ingestingFlag = false;
                        });
                    }
                }
            }
        }
        if (downloadingCount == 0) {
            console.log(processControl.activeDownloads);
            console.log('345BulkCrawler finished',  processControl.downloadCount + ' archives downloaded (' + processControl.totalGBytesDownloaded + ' GB); '+ processControl.dailyArchivesProcessed + ' archives processed');
            clearInterval(downloadOverSeer); //finished processing this one-day; turn off overseer
            if (startDownloadManagerCallback) startDownloadManagerCallback(processControl);
        }

        function addDayToReprocess(retryDate, cause){
            if(Array.isArray(processControl.days)) {
                var strRetryDate = retryDate.toISOString().substring(0,10); //date part only
                if(!processControl.retries) processControl.retries = {};
                processControl.retries[strRetryDate] = (processControl.retries[strRetryDate] || 0) + 1;
                if(processControl.retries[strRetryDate] <= processControl.maxRetries) {
                    console.log('Feeds downloads retry for '+retryDate, 'retry #'+processControl.retries[strRetryDate]+' due to '+cause);
                    processControl.days.push(strRetryDate);
                    processControl.dailyArchivesSubmittedForRetry++;
                } else {
                    console.log('ElasticSearch failure after 3 retries for '+retryDate, ' due to '+cause);
                }
            }  //queue for retry
        }
        function nextWeekday() {
            if(Array.isArray(processControl.days) && processControl.days.length){
                return new Date(processControl.days.pop());
            } else {
                if(!processControl.current && processControl.start) {
                    processControl.current = new Date(processControl.start);
                    return processControl.current;
                } else {
                    var nextWeekday = new Date(processControl.current);
                    nextWeekday.setUTCDate(nextWeekday.getUTCDate() + (nextWeekday.getUTCDay() == 5 ? 3 : 1)); //skip weekends (Sunday = 0)
                }
                if((processControl.end || Date.now()) > nextWeekday){
                    processControl.current = nextWeekday;
                    return nextWeekday;
                } else {
                    return false;
                }
            }
        }

        function downloadAndUntarDailyArchive(d, archiveDate, downloadAndUntarDailyArchiveCallback) {
            //1. download the archive  
            const ts = Date.now();
            const archiveName = archiveDate.toISOString().substring(0, 10).replace(/-/g, '');
            const archiveFilePath = processControl.feedsDir + archiveName + '.nc.tar.gz';
            const url = 'https://www.sec.gov/Archives/edgar/Feed/' + archiveDate.getFullYear()
                + '/QTR' + (Math.floor(archiveDate.getUTCMonth() / 3) + 1) + '/' + archiveName + '.nc.tar.gz';
            const downloadControl = {
                    timeStamp: ts,
                    d: d,
                    archiveDate: archiveDate,
                    archiveName: archiveName,
                    url: url,
                    status: 'downloading'
                };
            processControl.activeDownloads["d" + d] = downloadControl;  //could be replaced if long running process killed!!!
            console.log((new Date()).toISOString().substring(11, 19)+': d' + d + ' downloading ' + archiveName + ' from ' + url);
            
            const curlCmd = `curl "${url}" --compressed -H "Host: www.sec.gov" -H "User-Agent: ${config.SEC_USER_AGENT}" -q -o ${archiveFilePath}`; 
            //console.log(Date.now()+':  Executing ' + curlCmd);
            exec(curlCmd).on('exit', function(code){
                if(code===null) console.log('curl command returned null for ' + archiveName, curlCmd);
                if(code){
                    console.log('ElasticSearch bulk indexer unable to download archive (federal holiday?) code: ' + code, archiveName + ' ('+curlCmd+')');
                    downloadControl.status = '504';
                    exec('rm '+ archiveFilePath);  //remove any remains
                    if(downloadAndUntarDailyArchiveCallback) downloadAndUntarDailyArchiveCallback(downloadControl);
                } else {
                    if(fs.existsSync(archiveFilePath)){ //double check! (should be unnecessary, but experience says otherwise!)
                        processControl.downloadCount++;
                        //2. decompress archive
                        downloadControl.status = 'unarchiving';
                        downloadControl.timeStamp = Date.now();  //reset timeout timeStamp for unarchiving big files
                        const  fileStats = fs.statSync(archiveFilePath);  //blocking call
                        processControl.totalGBytesDownloaded += fileStats.size / (1024 * 1024 * 1024);
                        const archiveDir = processControl.feedsDir + downloadControl.archiveName;
                        exec('mkdir -m 777 ' + archiveDir).on('exit', function(code) {  //mkdir -m 777 /data/feeds/20190315
                            console.log(`${(new Date()).toISOString().substring(11, 19)}: d${d} downloaded and unarchiving ${downloadControl.archiveName }`);
                            const untarCmd = 'tar xzf ' + processControl.feedsDir + downloadControl.archiveName + '.nc.tar.gz -C ' + archiveDir;  //tar xzf /data/feeds/20190315.nc.tar.gz -C /data/feeds/20190315
                            exec(untarCmd).on('exit', function (code) {
                                if (code) {  //don't cancel.  Just log it.
                                    console.log("ElasticSearch bulk indexer untar error", code + ' return code for: ' + untarCmd + ' size in bytes: ' + fileStats.size);
                                    exec('rm ' + archiveFilePath);  //don't let bad files build up
                                    exec('rm ' + archiveDir + '/*').on('exit', function (code) {
                                        exec('rmdir ' + archiveDir);
                                        downloadControl.status = 'untar error';
                                        if (downloadAndUntarDailyArchiveCallback) downloadAndUntarDailyArchiveCallback(downloadControl);
                                    });
                                } else {
                                    console.log(`${(new Date()).toISOString().substring(11, 19)}: d${d} downloaded and unarchived ${downloadControl.archiveName}.nc.tar.gz (size: ${Math.round(fileStats.size / (1024 * 1024))} MB)`);
                                    exec('rm ' + archiveFilePath);  //delete tar file (async, but no need to t wait for completion)
                                    downloadControl.status = 'unarchived';
                                    if (downloadAndUntarDailyArchiveCallback) downloadAndUntarDailyArchiveCallback(downloadControl);
                                }
                            });
                        });
                    } else {
                        downloadControl.status = 'download error';
                        if (downloadAndUntarDailyArchiveCallback) downloadAndUntarDailyArchiveCallback(downloadControl);
                    }
                }
            });
        }
    }
}

function indexDirectory(processControl, downloadNum, ingestDirectoryCallback){
    const downloadControl = processControl.activeDownloads['d'+downloadNum];
    const directory = processControl.feedsDir + downloadControl.archiveName;
    const startIndexTime = Date.now();
    let slowestProcessingTime = 0,
        slowestForm,
        totalArchiveProcessingTime = 0,
        totalArchiveSubmissionsIndexed = 0,
        processedByteCount = 0;

    downloadControl.status = 'processing';
    fs.readdir(directory, function(err, fileNames) {
        let ingestFileNum, ingestOverSeer;
        if(err) {
            console.log("unable to read directory", directory);
            return false;
        } else {
            console.log(`${(new Date()).toISOString().substring(11, 19)}: d${downloadNum}  starting one-day files ingest ${directory} (${fileNames.length} files)`);
            ingestFileNum = -1;
            processControl.processes = {}; //clear references to processes from last directory ingested

            //EVENT TIMER FOR MASTER PROCESS KICKOFF AND MONITOR LOOP:
            ingestOverSeer = setInterval(overseeIngest, 100);
        }
        const feedDate = directory.split('/').pop();

        async function overseeIngest(directFromProcessNum){
            //1. check for available process slots and (and restart dead processes)
            processControl.runningCount = 0;
            //console.log(processControl.processes);
            for(let p=1; p<=processControl.maxFileIngests; p++){
                if(!processControl.processes["p"+p]) { //start process
                    let processInfo = processNextFile(p);
                    if(processInfo) {
                        processInfo.debugAdsh = processControl.debugAdsh;
                        processInfo.leaveSourceFiles = processControl.leaveSourceFiles;
                        processInfo.filingsDir = processControl.filingsDir;
                        processInfo.writeExtractedFiles = processControl.writeExtractedFiles;
                        processInfo.extractedFilesBucket = processControl.extractedFilesBucket;
                        processInfo.extractedFilesPrefix = processControl.extractedFilesPrefix;
                        processInfo.writeSgmlMetaDataFiles = processControl.writeSgmlMetaDataFiles;
                        processInfo.writeJsonMetaDataFiles = processControl.writeJsonMetaDataFiles;
                        processInfo.feedDate = feedDate;
                        processInfo.childProcess = fork(FEED_PROCESS_FILE);
                        processInfo.childProcess.on('message', submissionProcessed); 
                        processControl.processes["p"+p] = processInfo;
                        processControl.processes["p"+p].status = 'processing';
                        processControl.processes["p"+p].childProcess.send(processInfo);  //this start the filing processing
                        processControl.runningCount++;
                    }
                } else if (processControl.processes["p"+p].status == 'finished'){
                    let processInfo = processNextFile(p);
                    if(processInfo) {
                        processControl.processes["p"+p].name = processInfo.name;
                        processControl.processes["p"+p].path = processInfo.path;
                        processControl.processes["p"+p].timeStamp = processInfo.timeStamp;
                        processControl.processes["p"+p].status = 'processing';
                        processControl.processes["p"+p].childProcess.send(processControl.processes["p"+p]);  //this start the filing processing
                        processControl.runningCount++;
                    }
                } else {  //check health
                    processControl.runningCount++;
                    let runTime = Date.now() - processControl.processes["p"+p].timeStamp;
                    if(runTime > processControl.submissionProcessTimout){ // > 60 seconds for one file
                        console.log(`${(new Date()).toISOString().substring(11, 19)}: killing long index process ${processControl.processes["p"+p].name}`);
                        processControl.processes["p"+p].childProcess.kill();
                        delete processControl.processes["p"+p];  //process is dead to me:  a new child process will be forked on next tick of ingestOverSeer in 100ms
                    }
                }
            }

            if(processControl.runningCount == 0) {
                processControl.processedByteCount += processedByteCount;
                console.log(`${(new Date()).toISOString().substring(11, 19)}: d${downloadNum} processed submissions for ${directory}`, `Processed ${processControl.processedDocumentCount} documents in ${fileNames.length} submissions${directFromProcessNum ? ' (called by processNum '+directFromProcessNum+')' : ''}`);
                clearInterval(ingestOverSeer); //finished processing this one-day; turn off overseer
                ingestOverSeer = false;
                if(slowestProcessingTime) {
                    console.log(`Longest processing was ${slowestProcessingTime}ms for ${slowestForm}`);
                    console.log(`Average processing was ${Math.round(totalArchiveProcessingTime/totalArchiveSubmissionsIndexed)}ms across ${processControl.processedDocumentCount} files in ${totalArchiveSubmissionsIndexed} submissions in ${directory}`);
                    console.log(`${Math.round(10*processedByteCount/(1024*1024))/10}MB processed for this day in ${Math.round((Date.now()-startIndexTime)/100)/10}s (${Math.round(10*processControl.processedByteCount/(1024*1024))/10}MB cumulatively processed)`);
                }
                downloadControl.status = 'indexed';
                const archiveDir = processControl.feedsDir + downloadControl.archiveName;
                for(let p=1; p<=processControl.maxFileIngests; p++){  //each day gets new child processes to prevent mem leaks from building 
                    if(processControl.processes["p"+p]){
                        processControl.processes["p"+p].childProcess.kill();
                        delete processControl.processes["p"+p];
                    }
                }
                if(!processControl.leaveSourceFiles){
                    exec('rm ' + archiveDir + '/*').on('exit', function (code) {
                        exec('rmdir ' + archiveDir);
                    });
                };
    
                if(ingestDirectoryCallback) ingestDirectoryCallback(downloadControl);
            }
        }

        function processNextFile(processNum){  //the master index has reference to all submission; send the next files or false if none left to process
            while(ingestFileNum<fileNames.length-1) {
                ingestFileNum++;
                var fileName = fileNames[ingestFileNum];
                let filing = {
                    path: directory + '/',
                    name: fileName,
                    processNum: processNum,
                    timeStamp: Date.now()
                };
                return filing;
            }
            return false;
        }

        //helper function with access to processNextFile vars
        function submissionProcessed(result) {
            //console.log('received results from process!!', result);
            if(result.status=='ok'){
                //console.log('received results from process!!', result);
                totalArchiveProcessingTime += result.processTime;
                processedByteCount += result.processedByteCount;
                processControl.processedDocumentCount += result.processedDocumentCount||0;
                totalArchiveSubmissionsIndexed++;
                if(result.processTime>slowestProcessingTime){
                    slowestProcessingTime = result.processTime;
                    slowestForm = result.form;
                }
/*                 if(!result.entities.length){
                    if(!processControl.cikNotFoundForms) processControl.cikNotFoundForms = {};
                    processControl.cikNotFoundForms[result.form] = (processControl.cikNotFoundForms[result.form] || 0) + 1;
                } */
                processControl.totalSubmissionsProcessed++;
                processControl.processes['p'+result.processNum].status = 'finishing';
                processControl.processedCount[result.form] = (processControl.processedCount[result.form] || 0) + 1;
                for(let path in result.paths){ //analytics disabled and not returned, so loop doesn't execute
                    processControl.paths[path] = Math.max(processControl.paths[path]||0, result.paths[path]);
                }
                if(!processControl.leaveSourceFiles) exec(`rm ${directory}/${result.fileName}`);  //remove submission files as processed (reduces disk usage)
            } else {
                console.log('ERROR from edgarFeedFileProcessor', result, 'processNum ' + (result.processNum ? result.processNum : 'unknown'));
                console.log('ERROR from edgarFeedFileProcessor', 'processNum ' + (result.processNum ? result.processNum : 'unknown') + JSON.stringify(result));
            }
            setTimeout(()=>{ //give garbage collection a chance
                if(processControl.processes['p'+result.processNum]) {  //might be killed at the end of a directory ingest
                    
                }
                processControl.processes['p'+result.processNum].status = 'finished';
                overseeIngest(result.processNum);
            }, 5);
        }
    });
}

//asyncExec allows execution of Linux/OS commands using await syntax instead of nested callbacks
function asyncExec(commandLineString) {
    return new Promise((resolve, reject) => {
        exec(commandLineString).on('exit', (code) => {
            resolve(code)
        }).on('error', () => {
            resolve('error')
        });
    });
}
