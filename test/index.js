require('should');
var RSParser = require('../index');

describe('#RSParser', function () {
    var rsparser;
    before(function () {
        rsparser = new RSParser({
            id_regs: [/^\d+$/]
        });
    });

    describe('#_match_string', function () {
        it('normal', function () {
            rsparser._match_id(123).should.equal(true);
            rsparser._match_id('string').should.equal(false);
        });
    });

    describe('#_parse_query_string', function () {
        it('normal', function () {
            var chinese = encodeURIComponent('哈哈,撒的,12l3');
            var res = rsparser._parse_query_string('name='+ chinese +'&woca');

            res.name.should.equal('哈哈,撒的,12l3');
        })
    });

    describe('#parse', function () {
        var result;
        before(function () {
           result = rsparser.parse('person/157423/houses/live/346742');
        });

        it('get correct paths', function () {
            result.paths[0].should.containEql({id:'346742',name:'live'});
            result.paths[1].should.containEql({name: 'houses'});
            result.paths[2].should.containEql({ id: '157423',name:'person'});
        })
    })
});