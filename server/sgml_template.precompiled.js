var Handlebars = require("handlebars/runtime");  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['sgml_template'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "<PAPER>\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<CATEGORY>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"category") || (depth0 != null ? lookupProperty(depth0,"category") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"category","hash":{},"data":data,"loc":{"start":{"line":5,"column":26},"end":{"line":5,"column":40}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "<CONFIRMING-COPY>\n";
},"7":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<PUBLIC-DOCUMENT-COUNT>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"public_document_count") || (depth0 != null ? lookupProperty(depth0,"public_document_count") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"public_document_count","hash":{},"data":data,"loc":{"start":{"line":9,"column":53},"end":{"line":9,"column":78}}}) : helper)))
    + "\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<WITHDRAWN-ACCESSION-NUMBER>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"withdrawn_accession_number") || (depth0 != null ? lookupProperty(depth0,"withdrawn_accession_number") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"withdrawn_accession_number","hash":{},"data":data,"loc":{"start":{"line":11,"column":63},"end":{"line":11,"column":95}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<REFERENCE-462B>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"reference_462b") || (depth0 != null ? lookupProperty(depth0,"reference_462b") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"reference_462b","hash":{},"data":data,"loc":{"start":{"line":13,"column":39},"end":{"line":13,"column":59}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<PREVIOUS-ACCESSION-NUMBER>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"previous_accession_number") || (depth0 != null ? lookupProperty(depth0,"previous_accession_number") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"previous_accession_number","hash":{},"data":data,"loc":{"start":{"line":15,"column":61},"end":{"line":15,"column":92}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<CALENDAR-YEAR-ENDING>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"calendar_year_ending") || (depth0 != null ? lookupProperty(depth0,"calendar_year_ending") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"calendar_year_ending","hash":{},"data":data,"loc":{"start":{"line":17,"column":51},"end":{"line":17,"column":77}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"17":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<MA-I_INDIVIDUAL>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"ma_i_individual") || (depth0 != null ? lookupProperty(depth0,"ma_i_individual") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"ma_i_individual","hash":{},"data":data,"loc":{"start":{"line":19,"column":41},"end":{"line":19,"column":62}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"19":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<RULE>\n<RULE-NAME>"
    + ((stack1 = container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"rule") : depth0)) != null ? lookupProperty(stack1,"rule_name") : stack1), depth0)) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"rule") : depth0)) != null ? lookupProperty(stack1,"item") : stack1),{"name":"each","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":23,"column":0},"end":{"line":27,"column":9}}})) != null ? stack1 : "")
    + "</RULE>\n";
},"20":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ITEM>\n<ITEM-NUMBER>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"item_number") || (depth0 != null ? lookupProperty(depth0,"item_number") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"item_number","hash":{},"data":data,"loc":{"start":{"line":24,"column":13},"end":{"line":24,"column":30}}}) : helper))) != null ? stack1 : "")
    + "\n<ITEM-PERIOD>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"item_period") || (depth0 != null ? lookupProperty(depth0,"item_period") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"item_period","hash":{},"data":data,"loc":{"start":{"line":25,"column":13},"end":{"line":25,"column":30}}}) : helper))) != null ? stack1 : "")
    + "\n</ITEM>\n";
},"22":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<PERIOD>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"period") || (depth0 != null ? lookupProperty(depth0,"period") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"period","hash":{},"data":data,"loc":{"start":{"line":29,"column":23},"end":{"line":29,"column":33}}}) : helper)))
    + "\n";
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<DEPOSITOR-CIK>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"depositor_cik") || (depth0 != null ? lookupProperty(depth0,"depositor_cik") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"depositor_cik","hash":{},"data":data,"loc":{"start":{"line":31,"column":37},"end":{"line":31,"column":56}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"26":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<SPONSOR-CIK>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"sponsor_cik") || (depth0 != null ? lookupProperty(depth0,"sponsor_cik") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"sponsor_cik","hash":{},"data":data,"loc":{"start":{"line":33,"column":33},"end":{"line":33,"column":50}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"28":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<ITEMS>"
    + ((stack1 = container.lambda(depth0, depth0)) != null ? stack1 : "")
    + "\n";
},"30":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<REFERENCES-429>"
    + ((stack1 = container.lambda(depth0, depth0)) != null ? stack1 : "")
    + "\n";
},"32":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<RESOURCE-EXT-ISSUER>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"resource_ext_issuer") || (depth0 != null ? lookupProperty(depth0,"resource_ext_issuer") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"resource_ext_issuer","hash":{},"data":data,"loc":{"start":{"line":41,"column":49},"end":{"line":41,"column":74}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"34":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<FILING-DATE>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"filing_date") || (depth0 != null ? lookupProperty(depth0,"filing_date") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"filing_date","hash":{},"data":data,"loc":{"start":{"line":43,"column":33},"end":{"line":43,"column":48}}}) : helper)))
    + "\n";
},"36":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<PUBLIC-REL-DATE>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"public_rel_date") || (depth0 != null ? lookupProperty(depth0,"public_rel_date") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"public_rel_date","hash":{},"data":data,"loc":{"start":{"line":45,"column":41},"end":{"line":45,"column":60}}}) : helper)))
    + "\n";
},"38":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<DATE-OF-FILING-DATE-CHANGE>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"date_of_filing_date_change") || (depth0 != null ? lookupProperty(depth0,"date_of_filing_date_change") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"date_of_filing_date_change","hash":{},"data":data,"loc":{"start":{"line":47,"column":63},"end":{"line":47,"column":93}}}) : helper)))
    + "\n";
},"40":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"effectiveness_date") : depth0),{"name":"if","hash":{},"fn":container.program(41, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":50,"column":0},"end":{"line":51,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"filer") : depth0),{"name":"each","hash":{},"fn":container.program(43, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":52,"column":0},"end":{"line":53,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"subject_company") : depth0),{"name":"each","hash":{},"fn":container.program(45, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":54,"column":0},"end":{"line":55,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"reporting_owner") : depth0),{"name":"each","hash":{},"fn":container.program(47, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":56,"column":0},"end":{"line":57,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"issuer") : depth0),{"name":"if","hash":{},"fn":container.program(49, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":58,"column":0},"end":{"line":59,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"depositor") : depth0),{"name":"if","hash":{},"fn":container.program(51, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":60,"column":0},"end":{"line":61,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"securitizer") : depth0),{"name":"if","hash":{},"fn":container.program(53, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":62,"column":0},"end":{"line":63,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"filed_for") : depth0),{"name":"each","hash":{},"fn":container.program(55, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":64,"column":0},"end":{"line":65,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"issuing_entity") : depth0),{"name":"if","hash":{},"fn":container.program(57, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":66,"column":0},"end":{"line":67,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"filed_by") : depth0),{"name":"if","hash":{},"fn":container.program(59, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":68,"column":0},"end":{"line":69,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"underwriter") : depth0),{"name":"if","hash":{},"fn":container.program(61, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":70,"column":0},"end":{"line":72,"column":15}}})) != null ? stack1 : "");
},"41":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<EFFECTIVENESS-DATE>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"effectiveness_date") || (depth0 != null ? lookupProperty(depth0,"effectiveness_date") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"effectiveness_date","hash":{},"data":data,"loc":{"start":{"line":50,"column":47},"end":{"line":50,"column":69}}}) : helper)))
    + "\n";
},"43":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"entity"),depth0,{"name":"entity","hash":{"data":depth0,"entityType":"FILER"},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n";
},"45":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"entity"),depth0,{"name":"entity","hash":{"data":depth0,"entityType":"SUBJECT-COMPANY"},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n";
},"47":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"entity"),depth0,{"name":"entity","hash":{"data":depth0,"entityType":"REPORTING-OWNER"},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n";
},"49":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"entity"),depth0,{"name":"entity","hash":{"data":(depth0 != null ? lookupProperty(depth0,"issuer") : depth0),"entityType":"ISSUER"},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n";
},"51":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"entity"),depth0,{"name":"entity","hash":{"data":(depth0 != null ? lookupProperty(depth0,"depositor") : depth0),"entityType":"DEPOSITOR"},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n";
},"53":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"entity"),depth0,{"name":"entity","hash":{"data":(depth0 != null ? lookupProperty(depth0,"securitizer") : depth0),"entityType":"SECURITIZER"},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n";
},"55":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"entity"),depth0,{"name":"entity","hash":{"data":depth0,"entityType":"FILED-FOR"},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n";
},"57":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"entity"),depth0,{"name":"entity","hash":{"data":(depth0 != null ? lookupProperty(depth0,"issuing_entity") : depth0),"entityType":"ISSUING_ENTITY"},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n";
},"59":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"entity"),depth0,{"name":"entity","hash":{"data":(depth0 != null ? lookupProperty(depth0,"filed_by") : depth0),"entityType":"FILED-BY"},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n";
},"61":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"underwriter") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"if","hash":{},"fn":container.program(62, data, 0),"inverse":container.program(65, data, 0),"data":data,"loc":{"start":{"line":70,"column":20},"end":{"line":72,"column":7}}})) != null ? stack1 : "");
},"62":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"underwriter") : depth0),{"name":"each","hash":{},"fn":container.program(63, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":70,"column":46},"end":{"line":71,"column":9}}})) != null ? stack1 : "");
},"63":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"entity"),depth0,{"name":"entity","hash":{"data":depth0,"entityType":"UNDERWRITER"},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n";
},"65":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = container.invokePartial(lookupProperty(partials,"entity"),depth0,{"name":"entity","hash":{"data":(depth0 != null ? lookupProperty(depth0,"underwriter") : depth0),"entityType":"UNDERWRITER"},"data":data,"helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "")
    + "\n";
},"67":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"effectiveness_date") : depth0),{"name":"if","hash":{},"fn":container.program(41, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":75,"column":0},"end":{"line":76,"column":8}}})) != null ? stack1 : "");
},"69":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ABS-RULE>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"abs_rule") || (depth0 != null ? lookupProperty(depth0,"abs_rule") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"abs_rule","hash":{},"data":data,"loc":{"start":{"line":78,"column":27},"end":{"line":78,"column":41}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"71":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<REGISTERED-ENTITY>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"registered_entity") || (depth0 != null ? lookupProperty(depth0,"registered_entity") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"registered_entity","hash":{},"data":data,"loc":{"start":{"line":80,"column":45},"end":{"line":80,"column":68}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"73":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<NO-INITIAL-PERIOD-ACTIVITY>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"no_initial_period_activity") || (depth0 != null ? lookupProperty(depth0,"no_initial_period_activity") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"no_initial_period_activity","hash":{},"data":data,"loc":{"start":{"line":82,"column":63},"end":{"line":82,"column":95}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"75":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<PERIOD-START>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"period_start") || (depth0 != null ? lookupProperty(depth0,"period_start") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"period_start","hash":{},"data":data,"loc":{"start":{"line":84,"column":35},"end":{"line":84,"column":51}}}) : helper)))
    + "\n";
},"77":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<NO-QUARTERLY-ACTIVITY>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"no_quarterly_activity") || (depth0 != null ? lookupProperty(depth0,"no_quarterly_activity") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"no_quarterly_activity","hash":{},"data":data,"loc":{"start":{"line":86,"column":53},"end":{"line":86,"column":80}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"79":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<NO-ANNUAL-ACTIVITY>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"no_annual_activity") || (depth0 != null ? lookupProperty(depth0,"no_annual_activity") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"no_annual_activity","hash":{},"data":data,"loc":{"start":{"line":88,"column":47},"end":{"line":88,"column":71}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"81":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ABS-ASSET-CLASS>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"abs_asset_class") || (depth0 != null ? lookupProperty(depth0,"abs_asset_class") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"abs_asset_class","hash":{},"data":data,"loc":{"start":{"line":90,"column":41},"end":{"line":90,"column":62}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"83":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ABS-SUB-ASSET-CLASS>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"abs_sub_asset_class") || (depth0 != null ? lookupProperty(depth0,"abs_sub_asset_class") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"abs_sub_asset_class","hash":{},"data":data,"loc":{"start":{"line":92,"column":49},"end":{"line":92,"column":74}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"85":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ACCEPTANCE-DATETIME>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"acceptance_datetime") || (depth0 != null ? lookupProperty(depth0,"acceptance_datetime") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"acceptance_datetime","hash":{},"data":data,"loc":{"start":{"line":94,"column":49},"end":{"line":94,"column":72}}}) : helper)))
    + "\n";
},"87":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ACTION-DATE>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"action_date") || (depth0 != null ? lookupProperty(depth0,"action_date") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"action_date","hash":{},"data":data,"loc":{"start":{"line":96,"column":33},"end":{"line":96,"column":48}}}) : helper)))
    + "\n";
},"89":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<RECEIVED-DATE>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"received_date") || (depth0 != null ? lookupProperty(depth0,"received_date") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"received_date","hash":{},"data":data,"loc":{"start":{"line":98,"column":37},"end":{"line":98,"column":54}}}) : helper)))
    + "\n";
},"91":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<FILE-NUMBER>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"file_number") || (depth0 != null ? lookupProperty(depth0,"file_number") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"file_number","hash":{},"data":data,"loc":{"start":{"line":100,"column":33},"end":{"line":100,"column":48}}}) : helper)))
    + "\n";
},"93":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<FILM-NUMBER>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"film_number") || (depth0 != null ? lookupProperty(depth0,"film_number") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"film_number","hash":{},"data":data,"loc":{"start":{"line":102,"column":33},"end":{"line":102,"column":48}}}) : helper)))
    + "\n";
},"95":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<PUBLIC-REFERENCE-ACC>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"public_reference_acc") || (depth0 != null ? lookupProperty(depth0,"public_reference_acc") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"public_reference_acc","hash":{},"data":data,"loc":{"start":{"line":104,"column":51},"end":{"line":104,"column":77}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"97":function(container,depth0,helpers,partials,data) {
    return "<PRIVATE-TO-PUBLIC>\n";
},"99":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<IS-FILER-A-NEW-REGISTRANT>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"is_filer_a_new_registrant") || (depth0 != null ? lookupProperty(depth0,"is_filer_a_new_registrant") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"is_filer_a_new_registrant","hash":{},"data":data,"loc":{"start":{"line":108,"column":61},"end":{"line":108,"column":92}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"101":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<IS-FILER-A-WELL-KNOWN-SEASONED-ISSUER>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"is_filer_a_well_known_seasoned_issuer") || (depth0 != null ? lookupProperty(depth0,"is_filer_a_well_known_seasoned_issuer") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"is_filer_a_well_known_seasoned_issuer","hash":{},"data":data,"loc":{"start":{"line":110,"column":85},"end":{"line":110,"column":128}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"103":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<FILED-PURSUANT-TO-GENERAL-INSTRUCTION-A2>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"filed_pursuant_to_general_instruction_a2") || (depth0 != null ? lookupProperty(depth0,"filed_pursuant_to_general_instruction_a2") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"filed_pursuant_to_general_instruction_a2","hash":{},"data":data,"loc":{"start":{"line":112,"column":91},"end":{"line":112,"column":137}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"105":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<IS-FUND-24F2-ELIGIBLE>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"is_fund_24f2_eligible") || (depth0 != null ? lookupProperty(depth0,"is_fund_24f2_eligible") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"is_fund_24f2_eligible","hash":{},"data":data,"loc":{"start":{"line":114,"column":53},"end":{"line":114,"column":80}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"107":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<TIMESTAMP>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"timestamp") || (depth0 != null ? lookupProperty(depth0,"timestamp") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"timestamp","hash":{},"data":data,"loc":{"start":{"line":116,"column":29},"end":{"line":116,"column":44}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"109":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<GROUP-MEMBERS>"
    + ((stack1 = container.lambda(depth0, depth0)) != null ? stack1 : "")
    + "\n";
},"111":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"filer") : depth0),{"name":"each","hash":{},"fn":container.program(43, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":121,"column":0},"end":{"line":122,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"subject_company") : depth0),{"name":"each","hash":{},"fn":container.program(45, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":123,"column":0},"end":{"line":124,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"reporting_owner") : depth0),{"name":"each","hash":{},"fn":container.program(47, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":125,"column":0},"end":{"line":126,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"issuer") : depth0),{"name":"if","hash":{},"fn":container.program(49, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":127,"column":0},"end":{"line":128,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"depositor") : depth0),{"name":"if","hash":{},"fn":container.program(51, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":129,"column":0},"end":{"line":130,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"securitizer") : depth0),{"name":"if","hash":{},"fn":container.program(53, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":131,"column":0},"end":{"line":132,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"filed_for") : depth0),{"name":"each","hash":{},"fn":container.program(55, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":133,"column":0},"end":{"line":134,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"issuing_entity") : depth0),{"name":"if","hash":{},"fn":container.program(57, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":135,"column":0},"end":{"line":136,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"filed_by") : depth0),{"name":"if","hash":{},"fn":container.program(59, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":137,"column":0},"end":{"line":138,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"underwriter") : depth0),{"name":"if","hash":{},"fn":container.program(61, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":139,"column":0},"end":{"line":141,"column":15}}})) != null ? stack1 : "");
},"113":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<SERIES-AND-CLASSES-CONTRACTS-DATA>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"series_and_classes_contracts_data") : depth0)) != null ? lookupProperty(stack1,"new_series_and_classes_contracts") : stack1),{"name":"if","hash":{},"fn":container.program(114, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":144,"column":0},"end":{"line":167,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"series_and_classes_contracts_data") : depth0)) != null ? lookupProperty(stack1,"existing_series_and_classes_contracts") : stack1),{"name":"if","hash":{},"fn":container.program(123, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":168,"column":0},"end":{"line":180,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"series_and_classes_contracts_data") : depth0)) != null ? lookupProperty(stack1,"merger_series_and_classes_contracts") : stack1),{"name":"if","hash":{},"fn":container.program(126, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":181,"column":0},"end":{"line":210,"column":7}}})) != null ? stack1 : "")
    + "</SERIES-AND-CLASSES-CONTRACTS-DATA>\n";
},"114":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<NEW-SERIES-AND-CLASSES-CONTRACTS>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"series_and_classes_contracts_data") : depth0)) != null ? lookupProperty(stack1,"new_series_and_classes_contracts") : stack1)) != null ? lookupProperty(stack1,"owner_cik") : stack1),{"name":"if","hash":{},"fn":container.program(115, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":145,"column":0},"end":{"line":146,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"series_and_classes_contracts_data") : depth0)) != null ? lookupProperty(stack1,"new_series_and_classes_contracts") : stack1)) != null ? lookupProperty(stack1,"new_series") : stack1),{"name":"each","hash":{},"fn":container.program(117, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":147,"column":0},"end":{"line":156,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"series_and_classes_contracts_data") : depth0)) != null ? lookupProperty(stack1,"new_series_and_classes_contracts") : stack1)) != null ? lookupProperty(stack1,"new_classes_contracts") : stack1),{"name":"each","hash":{},"fn":container.program(121, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":157,"column":0},"end":{"line":166,"column":9}}})) != null ? stack1 : "")
    + "</NEW-SERIES-AND-CLASSES-CONTRACTS>\n";
},"115":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<OWNER-CIK>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"series_and_classes_contracts_data") : depth0)) != null ? lookupProperty(stack1,"new_series_and_classes_contracts") : stack1)) != null ? lookupProperty(stack1,"owner_cik") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"117":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<NEW-SERIES>\n<SERIES-ID>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"series_id") || (depth0 != null ? lookupProperty(depth0,"series_id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"series_id","hash":{},"data":data,"loc":{"start":{"line":148,"column":11},"end":{"line":148,"column":26}}}) : helper))) != null ? stack1 : "")
    + "\n<SERIES-NAME>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"series_name") || (depth0 != null ? lookupProperty(depth0,"series_name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"series_name","hash":{},"data":data,"loc":{"start":{"line":149,"column":13},"end":{"line":149,"column":30}}}) : helper))) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"class_contract") : depth0),{"name":"each","hash":{},"fn":container.program(118, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":150,"column":0},"end":{"line":155,"column":9}}})) != null ? stack1 : "")
    + "</NEW-SERIES>\n";
},"118":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<CLASS-CONTRACT>\n<CLASS-CONTRACT-ID>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"class_contract_id") || (depth0 != null ? lookupProperty(depth0,"class_contract_id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"class_contract_id","hash":{},"data":data,"loc":{"start":{"line":151,"column":19},"end":{"line":151,"column":42}}}) : helper))) != null ? stack1 : "")
    + "\n<CLASS-CONTRACT-NAME>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"class_contract_name") || (depth0 != null ? lookupProperty(depth0,"class_contract_name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"class_contract_name","hash":{},"data":data,"loc":{"start":{"line":152,"column":21},"end":{"line":152,"column":46}}}) : helper))) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"class_contract_ticker_symbol") : depth0),{"name":"if","hash":{},"fn":container.program(119, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":153,"column":0},"end":{"line":154,"column":7}}})) != null ? stack1 : "")
    + "</CLASS-CONTRACT>\n";
},"119":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<CLASS-CONTRACT-TICKER-SYMBOL>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"class_contract_ticker_symbol") || (depth0 != null ? lookupProperty(depth0,"class_contract_ticker_symbol") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"class_contract_ticker_symbol","hash":{},"data":data,"loc":{"start":{"line":153,"column":66},"end":{"line":153,"column":100}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"121":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<NEW-CLASSES-CONTRACTS>\n<SERIES-ID>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"series_id") || (depth0 != null ? lookupProperty(depth0,"series_id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"series_id","hash":{},"data":data,"loc":{"start":{"line":158,"column":11},"end":{"line":158,"column":26}}}) : helper))) != null ? stack1 : "")
    + "\n<SERIES-NAME>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"series_name") || (depth0 != null ? lookupProperty(depth0,"series_name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"series_name","hash":{},"data":data,"loc":{"start":{"line":159,"column":13},"end":{"line":159,"column":30}}}) : helper))) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"class_contract") : depth0),{"name":"each","hash":{},"fn":container.program(118, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":160,"column":0},"end":{"line":165,"column":9}}})) != null ? stack1 : "")
    + "</NEW-CLASSES-CONTRACTS>\n";
},"123":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<EXISTING-SERIES-AND-CLASSES-CONTRACTS>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"series_and_classes_contracts_data") : depth0)) != null ? lookupProperty(stack1,"existing_series_and_classes_contracts") : stack1)) != null ? lookupProperty(stack1,"series") : stack1),{"name":"each","hash":{},"fn":container.program(124, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":169,"column":0},"end":{"line":179,"column":9}}})) != null ? stack1 : "")
    + "</EXISTING-SERIES-AND-CLASSES-CONTRACTS>\n";
},"124":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<SERIES>\n<OWNER-CIK>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"owner_cik") || (depth0 != null ? lookupProperty(depth0,"owner_cik") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"owner_cik","hash":{},"data":data,"loc":{"start":{"line":170,"column":11},"end":{"line":170,"column":26}}}) : helper))) != null ? stack1 : "")
    + "\n<SERIES-ID>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"series_id") || (depth0 != null ? lookupProperty(depth0,"series_id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"series_id","hash":{},"data":data,"loc":{"start":{"line":171,"column":11},"end":{"line":171,"column":26}}}) : helper))) != null ? stack1 : "")
    + "\n<SERIES-NAME>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"series_name") || (depth0 != null ? lookupProperty(depth0,"series_name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"series_name","hash":{},"data":data,"loc":{"start":{"line":172,"column":13},"end":{"line":172,"column":30}}}) : helper))) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"class_contract") : depth0),{"name":"each","hash":{},"fn":container.program(118, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":173,"column":0},"end":{"line":178,"column":9}}})) != null ? stack1 : "")
    + "</SERIES>\n";
},"126":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<MERGER-SERIES-AND-CLASSES-CONTRACTS>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"series_and_classes_contracts_data") : depth0)) != null ? lookupProperty(stack1,"merger_series_and_classes_contracts") : stack1)) != null ? lookupProperty(stack1,"merger") : stack1),{"name":"each","hash":{},"fn":container.program(127, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":182,"column":0},"end":{"line":209,"column":9}}})) != null ? stack1 : "")
    + "</MERGER-SERIES-AND-CLASSES-CONTRACTS>\n";
},"127":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<MERGER>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"acquiring_data") : depth0),{"name":"if","hash":{},"fn":container.program(128, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":183,"column":0},"end":{"line":195,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"target_data") : depth0),{"name":"each","hash":{},"fn":container.program(131, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":196,"column":0},"end":{"line":208,"column":9}}})) != null ? stack1 : "")
    + "</MERGER>\n";
},"128":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ACQUIRING-DATA>\n<CIK>"
    + ((stack1 = container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"acquiring_data") : depth0)) != null ? lookupProperty(stack1,"cik") : stack1), depth0)) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),((stack1 = (depth0 != null ? lookupProperty(depth0,"acquiring_data") : depth0)) != null ? lookupProperty(stack1,"series") : stack1),{"name":"each","hash":{},"fn":container.program(129, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":185,"column":0},"end":{"line":194,"column":9}}})) != null ? stack1 : "")
    + "</ACQUIRING-DATA>\n";
},"129":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<SERIES>\n<SERIES-ID>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"series_id") || (depth0 != null ? lookupProperty(depth0,"series_id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"series_id","hash":{},"data":data,"loc":{"start":{"line":186,"column":11},"end":{"line":186,"column":26}}}) : helper))) != null ? stack1 : "")
    + "\n<SERIES-NAME>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"series_name") || (depth0 != null ? lookupProperty(depth0,"series_name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"series_name","hash":{},"data":data,"loc":{"start":{"line":187,"column":13},"end":{"line":187,"column":30}}}) : helper))) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"class_contract") : depth0),{"name":"each","hash":{},"fn":container.program(118, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":188,"column":0},"end":{"line":193,"column":9}}})) != null ? stack1 : "")
    + "</SERIES>\n";
},"131":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<TARGET-DATA>\n<CIK>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"cik") || (depth0 != null ? lookupProperty(depth0,"cik") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"cik","hash":{},"data":data,"loc":{"start":{"line":197,"column":5},"end":{"line":197,"column":14}}}) : helper))) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"series") : depth0),{"name":"if","hash":{},"fn":container.program(132, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":198,"column":0},"end":{"line":207,"column":16}}})) != null ? stack1 : "")
    + "</TARGET-DATA>\n";
},"132":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"series") : depth0),{"name":"each","hash":{},"fn":container.program(129, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":198,"column":14},"end":{"line":207,"column":9}}})) != null ? stack1 : "");
},"134":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<DOCUMENT>\n<TYPE>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"type") || (depth0 != null ? lookupProperty(depth0,"type") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data,"loc":{"start":{"line":213,"column":6},"end":{"line":213,"column":16}}}) : helper))) != null ? stack1 : "")
    + "\n<SEQUENCE>"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"sequence") || (depth0 != null ? lookupProperty(depth0,"sequence") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"sequence","hash":{},"data":data,"loc":{"start":{"line":214,"column":10},"end":{"line":214,"column":22}}}) : helper)))
    + "\n<FILENAME>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"filename") || (depth0 != null ? lookupProperty(depth0,"filename") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"filename","hash":{},"data":data,"loc":{"start":{"line":215,"column":10},"end":{"line":215,"column":24}}}) : helper))) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"description") : depth0),{"name":"if","hash":{},"fn":container.program(135, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":216,"column":0},"end":{"line":217,"column":7}}})) != null ? stack1 : "")
    + "</DOCUMENT>\n";
},"135":function(container,depth0,helpers,partials,data) {
    var stack1, helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<DESCRIPTION>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"description") || (depth0 != null ? lookupProperty(depth0,"description") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"description","hash":{},"data":data,"loc":{"start":{"line":216,"column":32},"end":{"line":216,"column":49}}}) : helper))) != null ? stack1 : "")
    + "\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<SUBMISSION>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"paper") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":3,"column":7}}})) != null ? stack1 : "")
    + "<ACCESSION-NUMBER>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"accession_number") || (depth0 != null ? lookupProperty(depth0,"accession_number") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"accession_number","hash":{},"data":data,"loc":{"start":{"line":3,"column":25},"end":{"line":3,"column":47}}}) : helper))) != null ? stack1 : "")
    + "\n<TYPE>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"type") || (depth0 != null ? lookupProperty(depth0,"type") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data,"loc":{"start":{"line":4,"column":6},"end":{"line":4,"column":16}}}) : helper))) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"category") : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":6,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"confirming_copy") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":8,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"public_document_count") : depth0),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":0},"end":{"line":10,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"withdrawn_accession_number") : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":11,"column":0},"end":{"line":12,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"reference_462b") : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":0},"end":{"line":14,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"previous_accession_number") : depth0),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":0},"end":{"line":16,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"calendar_year_ending") : depth0),{"name":"if","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":17,"column":0},"end":{"line":18,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"ma_i_individual") : depth0),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":0},"end":{"line":20,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"rule") : depth0),{"name":"if","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":21,"column":0},"end":{"line":28,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"period") : depth0),{"name":"if","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":29,"column":0},"end":{"line":30,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"depositor_cik") : depth0),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":31,"column":0},"end":{"line":32,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"sponsor_cik") : depth0),{"name":"if","hash":{},"fn":container.program(26, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":33,"column":0},"end":{"line":34,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"item") : depth0),{"name":"each","hash":{},"fn":container.program(28, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":35,"column":0},"end":{"line":36,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"items") : depth0),{"name":"each","hash":{},"fn":container.program(28, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":37,"column":0},"end":{"line":38,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"references_429") : depth0),{"name":"each","hash":{},"fn":container.program(30, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":39,"column":0},"end":{"line":40,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"resource_ext_issuer") : depth0),{"name":"if","hash":{},"fn":container.program(32, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":41,"column":0},"end":{"line":42,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"filing_date") : depth0),{"name":"if","hash":{},"fn":container.program(34, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":43,"column":0},"end":{"line":44,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"public_rel_date") : depth0),{"name":"if","hash":{},"fn":container.program(36, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":45,"column":0},"end":{"line":46,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"date_of_filing_date_change") : depth0),{"name":"if","hash":{},"fn":container.program(38, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":47,"column":0},"end":{"line":48,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"isInvestmentCompanyForm")||(depth0 && lookupProperty(depth0,"isInvestmentCompanyForm"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"type") : depth0),{"name":"isInvestmentCompanyForm","hash":{},"data":data,"loc":{"start":{"line":49,"column":7},"end":{"line":49,"column":37}}}),{"name":"if","hash":{},"fn":container.program(40, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":49,"column":0},"end":{"line":73,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(lookupProperty(helpers,"isInvestmentCompanyForm")||(depth0 && lookupProperty(depth0,"isInvestmentCompanyForm"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"type") : depth0),{"name":"isInvestmentCompanyForm","hash":{},"data":data,"loc":{"start":{"line":74,"column":11},"end":{"line":74,"column":41}}}),{"name":"unless","hash":{},"fn":container.program(67, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":74,"column":0},"end":{"line":77,"column":12}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"abs_rule") : depth0),{"name":"if","hash":{},"fn":container.program(69, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":78,"column":0},"end":{"line":79,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"registered_entity") : depth0),{"name":"if","hash":{},"fn":container.program(71, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":80,"column":0},"end":{"line":81,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"no_initial_period_activity") : depth0),{"name":"if","hash":{},"fn":container.program(73, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":82,"column":0},"end":{"line":83,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"period_start") : depth0),{"name":"if","hash":{},"fn":container.program(75, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":84,"column":0},"end":{"line":85,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"no_quarterly_activity") : depth0),{"name":"if","hash":{},"fn":container.program(77, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":86,"column":0},"end":{"line":87,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"no_annual_activity") : depth0),{"name":"if","hash":{},"fn":container.program(79, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":88,"column":0},"end":{"line":89,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"abs_asset_class") : depth0),{"name":"if","hash":{},"fn":container.program(81, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":90,"column":0},"end":{"line":91,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"abs_sub_asset_class") : depth0),{"name":"if","hash":{},"fn":container.program(83, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":92,"column":0},"end":{"line":93,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"acceptance_datetime") : depth0),{"name":"if","hash":{},"fn":container.program(85, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":94,"column":0},"end":{"line":95,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"action_date") : depth0),{"name":"if","hash":{},"fn":container.program(87, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":96,"column":0},"end":{"line":97,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"received_date") : depth0),{"name":"if","hash":{},"fn":container.program(89, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":98,"column":0},"end":{"line":99,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"file_number") : depth0),{"name":"if","hash":{},"fn":container.program(91, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":100,"column":0},"end":{"line":101,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"film_number") : depth0),{"name":"if","hash":{},"fn":container.program(93, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":102,"column":0},"end":{"line":103,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"public_reference_acc") : depth0),{"name":"if","hash":{},"fn":container.program(95, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":104,"column":0},"end":{"line":105,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"private_to_public") : depth0),{"name":"if","hash":{},"fn":container.program(97, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":106,"column":0},"end":{"line":107,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"is_filer_a_new_registrant") : depth0),{"name":"if","hash":{},"fn":container.program(99, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":108,"column":0},"end":{"line":109,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"is_filer_a_well_known_seasoned_issuer") : depth0),{"name":"if","hash":{},"fn":container.program(101, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":110,"column":0},"end":{"line":111,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"filed_pursuant_to_general_instruction_a2") : depth0),{"name":"if","hash":{},"fn":container.program(103, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":112,"column":0},"end":{"line":113,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"is_fund_24f2_eligible") : depth0),{"name":"if","hash":{},"fn":container.program(105, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":114,"column":0},"end":{"line":115,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"timestamp") : depth0),{"name":"if","hash":{},"fn":container.program(107, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":116,"column":0},"end":{"line":117,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"group_members") : depth0),{"name":"each","hash":{},"fn":container.program(109, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":118,"column":0},"end":{"line":119,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"unless").call(alias1,(lookupProperty(helpers,"isInvestmentCompanyForm")||(depth0 && lookupProperty(depth0,"isInvestmentCompanyForm"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"type") : depth0),{"name":"isInvestmentCompanyForm","hash":{},"data":data,"loc":{"start":{"line":120,"column":11},"end":{"line":120,"column":41}}}),{"name":"unless","hash":{},"fn":container.program(111, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":120,"column":0},"end":{"line":142,"column":12}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"series_and_classes_contracts_data") : depth0),{"name":"if","hash":{},"fn":container.program(113, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":143,"column":0},"end":{"line":211,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"document") : depth0),{"name":"each","hash":{},"fn":container.program(134, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":212,"column":0},"end":{"line":218,"column":9}}})) != null ? stack1 : "")
    + "</SUBMISSION>\n";
},"usePartial":true,"useData":true});
templates['sgml_entity_partial'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<OWNER-DATA>\n<CONFORMED-NAME>"
    + ((stack1 = alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"owner_data") : stack1)) != null ? lookupProperty(stack1,"conformed_name") : stack1), depth0)) != null ? stack1 : "")
    + "\n<CIK>"
    + ((stack1 = alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"owner_data") : stack1)) != null ? lookupProperty(stack1,"cik") : stack1), depth0)) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"owner_data") : stack1)) != null ? lookupProperty(stack1,"assigned_sic") : stack1),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":0},"end":{"line":6,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"owner_data") : stack1)) != null ? lookupProperty(stack1,"organization_name") : stack1),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":7,"column":0},"end":{"line":7,"column":198}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"owner_data") : stack1)) != null ? lookupProperty(stack1,"irs_number") : stack1),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":0},"end":{"line":9,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"owner_data") : stack1)) != null ? lookupProperty(stack1,"state_of_incorporation") : stack1),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":0},"end":{"line":11,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"owner_data") : stack1)) != null ? lookupProperty(stack1,"fiscal_year_end") : stack1),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":0},"end":{"line":13,"column":7}}})) != null ? stack1 : "")
    + "</OWNER-DATA>\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ASSIGNED-SIC>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"owner_data") : stack1)) != null ? lookupProperty(stack1,"assigned_sic") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ORGANIZATION-NAME>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"owner_data") : stack1)) != null ? lookupProperty(stack1,"organization_name") : stack1), depth0)) != null ? stack1 : "");
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"hasProperty")||(depth0 && lookupProperty(depth0,"hasProperty"))||container.hooks.helperMissing).call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"owner_data") : stack1),"organization_name",{"name":"hasProperty","hash":{},"data":data,"loc":{"start":{"line":7,"column":114},"end":{"line":7,"column":163}}}),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":108},"end":{"line":7,"column":191}}})) != null ? stack1 : "");
},"7":function(container,depth0,helpers,partials,data) {
    return "<ORGANIZATION-NAME>";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<IRS-NUMBER>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"owner_data") : stack1)) != null ? lookupProperty(stack1,"irs_number") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<STATE-OF-INCORPORATION>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"owner_data") : stack1)) != null ? lookupProperty(stack1,"state_of_incorporation") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"13":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<FISCAL-YEAR-END>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"owner_data") : stack1)) != null ? lookupProperty(stack1,"fiscal_year_end") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"15":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=container.lambda, alias2=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<COMPANY-DATA>\n<CONFORMED-NAME>"
    + ((stack1 = alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"company_data") : stack1)) != null ? lookupProperty(stack1,"conformed_name") : stack1), depth0)) != null ? stack1 : "")
    + "\n<CIK>"
    + ((stack1 = alias1(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"company_data") : stack1)) != null ? lookupProperty(stack1,"cik") : stack1), depth0)) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"company_data") : stack1)) != null ? lookupProperty(stack1,"assigned_sic") : stack1),{"name":"if","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":0},"end":{"line":20,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"company_data") : stack1)) != null ? lookupProperty(stack1,"organization_name") : stack1),{"name":"if","hash":{},"fn":container.program(18, data, 0),"inverse":container.program(20, data, 0),"data":data,"loc":{"start":{"line":21,"column":0},"end":{"line":21,"column":204}}})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"company_data") : stack1)) != null ? lookupProperty(stack1,"irs_number") : stack1),{"name":"if","hash":{},"fn":container.program(22, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":22,"column":0},"end":{"line":23,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"company_data") : stack1)) != null ? lookupProperty(stack1,"state_of_incorporation") : stack1),{"name":"if","hash":{},"fn":container.program(24, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":24,"column":0},"end":{"line":25,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias2,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"company_data") : stack1)) != null ? lookupProperty(stack1,"fiscal_year_end") : stack1),{"name":"if","hash":{},"fn":container.program(26, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":26,"column":0},"end":{"line":27,"column":7}}})) != null ? stack1 : "")
    + "</COMPANY-DATA>\n";
},"16":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ASSIGNED-SIC>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"company_data") : stack1)) != null ? lookupProperty(stack1,"assigned_sic") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"18":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ORGANIZATION-NAME>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"company_data") : stack1)) != null ? lookupProperty(stack1,"organization_name") : stack1), depth0)) != null ? stack1 : "");
},"20":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"hasProperty")||(depth0 && lookupProperty(depth0,"hasProperty"))||container.hooks.helperMissing).call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"company_data") : stack1),"organization_name",{"name":"hasProperty","hash":{},"data":data,"loc":{"start":{"line":21,"column":118},"end":{"line":21,"column":169}}}),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":21,"column":112},"end":{"line":21,"column":197}}})) != null ? stack1 : "");
},"22":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<IRS-NUMBER>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"company_data") : stack1)) != null ? lookupProperty(stack1,"irs_number") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"24":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<STATE-OF-INCORPORATION>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"company_data") : stack1)) != null ? lookupProperty(stack1,"state_of_incorporation") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"26":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<FISCAL-YEAR-END>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"company_data") : stack1)) != null ? lookupProperty(stack1,"fiscal_year_end") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"28":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<FILING-VALUES>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"filing_values") : stack1)) != null ? lookupProperty(stack1,"form_type") : stack1),{"name":"if","hash":{},"fn":container.program(29, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":31,"column":0},"end":{"line":32,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"filing_values") : stack1)) != null ? lookupProperty(stack1,"act") : stack1),{"name":"if","hash":{},"fn":container.program(31, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":33,"column":0},"end":{"line":34,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"filing_values") : stack1)) != null ? lookupProperty(stack1,"file_number") : stack1),{"name":"if","hash":{},"fn":container.program(33, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":35,"column":0},"end":{"line":36,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"filing_values") : stack1)) != null ? lookupProperty(stack1,"film_number") : stack1),{"name":"if","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":37,"column":0},"end":{"line":38,"column":7}}})) != null ? stack1 : "")
    + "</FILING-VALUES>\n";
},"29":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<FORM-TYPE>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"filing_values") : stack1)) != null ? lookupProperty(stack1,"form_type") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"31":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ACT>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"filing_values") : stack1)) != null ? lookupProperty(stack1,"act") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"33":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<FILE-NUMBER>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"filing_values") : stack1)) != null ? lookupProperty(stack1,"file_number") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"35":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<FILM-NUMBER>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"filing_values") : stack1)) != null ? lookupProperty(stack1,"film_number") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"37":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<BUSINESS-ADDRESS>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"business_address") : stack1)) != null ? lookupProperty(stack1,"street1") : stack1),{"name":"if","hash":{},"fn":container.program(38, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":42,"column":0},"end":{"line":43,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"business_address") : stack1)) != null ? lookupProperty(stack1,"street2") : stack1),{"name":"if","hash":{},"fn":container.program(40, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":44,"column":0},"end":{"line":45,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"business_address") : stack1)) != null ? lookupProperty(stack1,"city") : stack1),{"name":"if","hash":{},"fn":container.program(42, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":46,"column":0},"end":{"line":47,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"business_address") : stack1)) != null ? lookupProperty(stack1,"state") : stack1),{"name":"if","hash":{},"fn":container.program(44, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":48,"column":0},"end":{"line":49,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"business_address") : stack1)) != null ? lookupProperty(stack1,"zip") : stack1),{"name":"if","hash":{},"fn":container.program(46, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":50,"column":0},"end":{"line":51,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"business_address") : stack1)) != null ? lookupProperty(stack1,"phone") : stack1),{"name":"if","hash":{},"fn":container.program(48, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":52,"column":0},"end":{"line":53,"column":7}}})) != null ? stack1 : "")
    + "</BUSINESS-ADDRESS>\n";
},"38":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<STREET1>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"business_address") : stack1)) != null ? lookupProperty(stack1,"street1") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"40":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<STREET2>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"business_address") : stack1)) != null ? lookupProperty(stack1,"street2") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"42":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<CITY>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"business_address") : stack1)) != null ? lookupProperty(stack1,"city") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"44":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<STATE>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"business_address") : stack1)) != null ? lookupProperty(stack1,"state") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"46":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ZIP>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"business_address") : stack1)) != null ? lookupProperty(stack1,"zip") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"48":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<PHONE>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"business_address") : stack1)) != null ? lookupProperty(stack1,"phone") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"50":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<MAIL-ADDRESS>\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"mail_address") : stack1)) != null ? lookupProperty(stack1,"street1") : stack1),{"name":"if","hash":{},"fn":container.program(51, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":57,"column":0},"end":{"line":58,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"mail_address") : stack1)) != null ? lookupProperty(stack1,"street2") : stack1),{"name":"if","hash":{},"fn":container.program(53, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":59,"column":0},"end":{"line":60,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"mail_address") : stack1)) != null ? lookupProperty(stack1,"city") : stack1),{"name":"if","hash":{},"fn":container.program(55, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":61,"column":0},"end":{"line":62,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"mail_address") : stack1)) != null ? lookupProperty(stack1,"state") : stack1),{"name":"if","hash":{},"fn":container.program(57, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":63,"column":0},"end":{"line":64,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"mail_address") : stack1)) != null ? lookupProperty(stack1,"zip") : stack1),{"name":"if","hash":{},"fn":container.program(59, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":65,"column":0},"end":{"line":66,"column":7}}})) != null ? stack1 : "")
    + "</MAIL-ADDRESS>\n";
},"51":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<STREET1>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"mail_address") : stack1)) != null ? lookupProperty(stack1,"street1") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"53":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<STREET2>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"mail_address") : stack1)) != null ? lookupProperty(stack1,"street2") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"55":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<CITY>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"mail_address") : stack1)) != null ? lookupProperty(stack1,"city") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"57":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<STATE>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"mail_address") : stack1)) != null ? lookupProperty(stack1,"state") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"59":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<ZIP>"
    + ((stack1 = container.lambda(((stack1 = ((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"mail_address") : stack1)) != null ? lookupProperty(stack1,"zip") : stack1), depth0)) != null ? stack1 : "")
    + "\n";
},"61":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<FORMER-COMPANY>\n<FORMER-CONFORMED-NAME>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"former_conformed_name") || (depth0 != null ? lookupProperty(depth0,"former_conformed_name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"former_conformed_name","hash":{},"data":data,"loc":{"start":{"line":70,"column":23},"end":{"line":70,"column":50}}}) : helper))) != null ? stack1 : "")
    + "\n<DATE-CHANGED>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"date_changed") || (depth0 != null ? lookupProperty(depth0,"date_changed") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"date_changed","hash":{},"data":data,"loc":{"start":{"line":71,"column":14},"end":{"line":71,"column":32}}}) : helper))) != null ? stack1 : "")
    + "\n</FORMER-COMPANY>\n";
},"63":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<FORMER-NAME>\n<FORMER-CONFORMED-NAME>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"former_conformed_name") || (depth0 != null ? lookupProperty(depth0,"former_conformed_name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"former_conformed_name","hash":{},"data":data,"loc":{"start":{"line":75,"column":23},"end":{"line":75,"column":50}}}) : helper))) != null ? stack1 : "")
    + "\n<DATE-CHANGED>"
    + ((stack1 = ((helper = (helper = lookupProperty(helpers,"date_changed") || (depth0 != null ? lookupProperty(depth0,"date_changed") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"date_changed","hash":{},"data":data,"loc":{"start":{"line":76,"column":14},"end":{"line":76,"column":32}}}) : helper))) != null ? stack1 : "")
    + "\n</FORMER-NAME>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<"
    + alias4(((helper = (helper = lookupProperty(helpers,"entityType") || (depth0 != null ? lookupProperty(depth0,"entityType") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"entityType","hash":{},"data":data,"loc":{"start":{"line":1,"column":1},"end":{"line":1,"column":15}}}) : helper)))
    + ">\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"owner_data") : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":0},"end":{"line":15,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"company_data") : stack1),{"name":"if","hash":{},"fn":container.program(15, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":16,"column":0},"end":{"line":29,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"filing_values") : stack1),{"name":"if","hash":{},"fn":container.program(28, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":30,"column":0},"end":{"line":40,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"business_address") : stack1),{"name":"if","hash":{},"fn":container.program(37, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":41,"column":0},"end":{"line":55,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"mail_address") : stack1),{"name":"if","hash":{},"fn":container.program(50, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":56,"column":0},"end":{"line":68,"column":8}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"former_company") : stack1),{"name":"each","hash":{},"fn":container.program(61, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":69,"column":0},"end":{"line":73,"column":10}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"data") : depth0)) != null ? lookupProperty(stack1,"former_name") : stack1),{"name":"each","hash":{},"fn":container.program(63, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":74,"column":0},"end":{"line":78,"column":9}}})) != null ? stack1 : "")
    + "</"
    + alias4(((helper = (helper = lookupProperty(helpers,"entityType") || (depth0 != null ? lookupProperty(depth0,"entityType") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"entityType","hash":{},"data":data,"loc":{"start":{"line":79,"column":2},"end":{"line":79,"column":16}}}) : helper)))
    + ">";
},"useData":true});
