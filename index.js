function RSParser (obj) {
    this.id_regs = obj.id_regs;

    this.default_per_page = {};
    if ( 'undefined' == typeof obj.default_per_page) {
        this.default_per_page = 20;
    } else {
        this.default_per_page = obj.default_per_page;
    }
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
        limit: this.default_per_page,
        fields:[]
    };

    url = {
        self: url.substr(0, url.indexOf('?')),
        query: url.substr(url.indexOf('?') +1 )
    };
    //parse path
    url.self.split('/').forEach(function (e) {
        if (_this._match_id(e)) {
            result.paths[0]['id'] = e;
        } else if (e){
            result.paths.unshift({name: e});
        }
    });

    //parse filters
    var reserve = ['per_page', 'page', 'sort', 'fields'];
    var query = this._parse_query_string(url.query);

    for (var key in query) {
        if (query.hasOwnProperty(key)) {
            if ( -1 != reserve.indexOf(key)) {
                continue;
            }

            //todo bad request detect (such as '>' with 'in')
            result.filters.push(this._parse_filter(key, query[key]));
        }
    }

    //parse sort
    if ( 'undefined' != typeof query.sort) {
        var sort_fields = query.sort.split(',');

        var order;
        for (var i = sort_fields.length; i--;) {

            if ( '-' == sort_fields[i].charAt(0)) {
                order = 'desc';
                sort_fields[i] = sort_fields[i].substr(1);
            } else {
                order = 'asc';
            }

            result.sort.push({name: sort_fields[i], order: order});
        }
    }


    //parse page
    if ( 'undefined' != typeof query['per_page']) {
        result.limit = parseInt(query['per_page']);
    }

    if ('undefined' != typeof query['page']) {
        result.skip = (query['page'] - 1) * result.limit;
    }

    //parse fields
    if ('undefined' != typeof query['fields']) {
        result.fields = query['fields'].split(',');
    }

    return result;
};

module.exports = RSParser;