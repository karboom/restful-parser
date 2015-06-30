function RSParser (obj) {
    this.id_regs = obj.id_regs;
}

RSParser.prototype._match_id = function (string) {
    for (var i = this.id_regs.length; i--;) {
        if (this.id_regs[i].test(string)) {
            return true;
        }
    }

    return false;
};

RSParser.prototype._parse_query_string = function (string) {
    var result = {},
        each = [],
        queries = string.split('&');

    for (var i = queries.length; i--;) {
        each = queries[i].split('=');
        result[decodeURIComponent(each[0])] = decodeURIComponent(each[1]);
    }

    return result;
};

RSParser.prototype._parse_filter = function (key, val) {
    var prefix_op = {
        'max_' : '<',
        'min_' : '>',
        'exc_' : '!=',
        'inc_' : 'in'
    };

    var op = '=';
    var name = key;
    for (var prefix in prefix_op) {
        if (prefix_op.hasOwnProperty(prefix)) {
            if ( 0 == key.indexOf(prefix)) {
                op = prefix_op[prefix];
                name = key.substr(prefix.length);
                break;
            }
        }
    }

    if ( 'in' == op) {
        val = val.split(',');
    }

    //todo support Date,Regexp...
    return {
        name: name,
        op: op,
        value: val
    };
};

RSParser.prototype.parse = function (url, headers) {
    var _this = this;
    var result = {
        paths: [],
        filters:[],
        sort:[],
        skip: 0,
        limit: 0,
        fields:[]
    };

    //parse path
    url.split('/').forEach(function (e) {
        if (_this._match_id(e)) {
            result.paths[0]['id'] = e;
        } else if (e){
            result.paths.unshift({name: e});
        }
    });

    //parse filters
    var reserve = ['per_page', 'page', 'sort', 'fields'];
    var query = this._parse_query_string(url);

    for (var key in query) {
        if (query.hasOwnProperty(key)) {
            if ( -1 == reserve.indexOf(key)) {
                continue;
            }

            //todo bad request detect (such as '>' with 'in')
            result.filters.push(this._parse_filter(key, query[key]));


        }
    }

    return result;
};

module.exports = RSParser;