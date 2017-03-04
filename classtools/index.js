var cheerio = require('cheerio');

function html2array(html) {

  var $ = cheerio.load(html)

  var tr = $('tr').filter(function (index, el) {
    if (el.children.length == 0) 
      return false;
    else 
      return el;
    }
  )

  var tr_header = tr[0];
  var tr_rest = tr.slice(1);
  var ret = []
  var namespace = {
    _key: [
      'classType',
      'classID',
      'className',
      'who',
      'where',
      'when',
      'worth',
      'status'
    ],
    _value: []
  }
  tr_header
    .children
    .forEach((td) => {
      namespace
        ._value
        .push(td.children[0].data);
    })

  for (let i = 0; i < tr_rest.length; i++) {

    let _td = tr_rest[i]
      .children
      .filter(el => {
        if (el.type == "tag") 
          return true;
        return false;
      });
    let _obj = {};

    for(let i=0;i<namespace._key.length;i++){
      
      _obj[namespace._key[i]] = _td[i].children[0]?_td[i].children[0].data:0;
    }
    ret.push(_obj);
 
  }

  return ret

}

exports.html2array = html2array;
