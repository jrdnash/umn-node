'use strict';

const request = require('request');
const cheerio = require('cheerio');

var headers = {
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate, sdch",
  "Accept-Language": "en-US,en;q=0.8",
  "Connection": "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": "Mozilla/5.0",
};

class UMN {
  constructor(username, password) {
    this._j = request.jar();
    this.username = username;
    this.password = password;
  }

  balance(callback) {
    var requestBalance = (err, res, body) => {
      if(err) {
        callback(err);
        return;
      }

      var balance = {};
      var $ = cheerio.load(body);

      $('table.balance > tr').each(function(index, element) {
        if(index > 1) {
          var tds = $('td', element);
          balance[$(tds[1]).text()] = parseFloat($(tds[2]).text());
        }
      });

      callback(null, balance);
    };

    this.request('https://gophergold.umn.edu/balance.php?month=1%2F2016&tender=All', requestBalance);
  }

  schedule(callback) {
    this.request('https://www.myu.umn.edu/psp/psprd/EMPLOYEE/CAMP/s/WEBLIB_IS_DS.ISCRIPT1.FieldFormula.IScript_DrawSection?group=UM_SSS&section=UM_SSS_ACAD_SCHEDULE&pslnk=1', (err, res, body) => {
      if(err) {
        callback(err);
        return;
      }

      var $ = cheerio.load(body);

      var schedule = {};
      $('td').each(function(index, element) {
        var day = [];
        $('.Sdnt_Sched_Meeting', element).each(function(index, meeting) {
          var meetingObj = {};
          meetingObj.class = $('.subject_title a', meeting).text();
          meetingObj.className = $('.subject_title i', meeting).text();
          meetingObj.time = $('.StdntSched_Time', meeting).text();
          meetingObj.location = $('.StdntSched_Bldg_Descr', meeting).text();
          day.push(meetingObj);
        });
        schedule[element.attribs['data-label'].toLowerCase()] = day;
      });
      callback(null, schedule);
    });
  }

  request(url, callback) {
    var subrequest = (err, res, body) => {
      if(err) {
        callback(err, res, body);
        return;
      }
      if(res.headers.location) {
        subrequest2(res.headers.location);
        return;
      }
      if(res.request.uri.href === 'https://idp2.shib.umn.edu:443/idp/profile/SAML2/Redirect/SSO') {
        var $ = cheerio.load(body);
        var form = {};
        $('input[type=hidden]').each(function(index, element) {
          form[element.attribs['name']] = element.attribs['value'];
        });

        request.post(decodeURI($('form').attr('action')), {
          jar: this._j,
          headers: headers,
          form: form
        }, subrequest);
        return;
      }
      if(res.request.uri.href === 'https://idp2.shib.umn.edu:443/idp/umn/login') {
        request.post('https://idp2.shib.umn.edu/idp/umn/authn', {
          jar: this._j,
          headers: headers,
          form: {
            j_username: this.username,
            j_password: this.password
          }
        }, subrequest);
        return;
      }
      if(res.request.uri.href === 'https://idp2.shib.umn.edu/idp/umn/authn') {
        var $ = cheerio.load(body);
        var errorMessage = $('section.error > h1').text().trim().toLowerCase();
        callback({ message: errorMessage }, res, body);
        return;
      }
      var $ = cheerio.load(body);
      if($('body').attr('onload') === 'psSignIn();') {
        subrequest2('https://www.myu.umn.edu/psc/psprd/EMPLOYEE/EMPL/s/WEBLIB_UM_AUTH.UM_SHIB_AUTH.FieldFormula.IScript_signon?PSTarget=http%3A//www.myu.umn.edu/ShibAuth');
        return;
      }
      if(res.request.uri.href === 'https://www.myu.umn.edu/psp/psprd/EMPLOYEE/EMPL/h/?tab=DEFAULT') {
        subrequest2(url);
        return;
      }

      callback(null, res, body);
    };

    var subrequest2 = (url) => {
      request(url, {
        followRedirect: false,
        jar: this._j,
        headers: headers,
        gzip: true
      }, subrequest);
    }
    subrequest2(url);
  }
}

module.exports = UMN;
