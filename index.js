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
        } else {
            result.paths.unshift({name: e});
        }
    });

    //parse filters
    var reserve = ['per_page', 'page', 'sort', 'fields'];



    return result;
};

module.exports = RSParser;