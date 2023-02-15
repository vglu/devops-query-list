const request = require('request');

export default async function handler(req, res) {

  console.log("get-workItems-for-project API  *************************************");
  console.log(req.body);

  const urlLocal = req.body.url;
  const org = req.body.org;
  const project = req.body.project;
  const query = req.body.query;
  const queryName = req.body.queryName;
  const pat = req.body.pat;
  
  var url = urlLocal + '/';

  if (org) {
    url += org + '/';
  }

  url += project;
  url += '/_apis/wit/wiql/';
  url += query;
  url += '?$expand=clauses&api-version=6.0';
  url += '&Authorization=Basic BASE64PATSTRING';

  console.log(url);

  const auth = 'Basic ' + btoa(':' + pat);
  console.log(auth);

  var options = {
    'method': 'GET',
    'url': url,
    'headers': {
      'Authorization': auth,
      'Cookie': 'VstsSession=%7B%22PersistentSessionId%22%3A%22e1befab2-8f1a-4074-9523-58bc6b54ea4b%22%2C%22PendingAuthenticationSessionId%22%3A%2200000000-0000-0000-0000-000000000000%22%2C%22CurrentAuthenticationSessionId%22%3A%2200000000-0000-0000-0000-000000000000%22%2C%22SignInState%22%3A%7B%7D%7D'
    }
  };

  request(options, function (error, response) {
    if (error) {
      res.status(501).json(error.message);
      //throw new Error(error);
    } else {
      //const resp1 = JSON.parse(response.body);
      //const resp2 = resp1.workItems;
      //res.status(200).json(JSON.stringify(resp2))
      if (response.statusCode === 200) {
        const reapArray = JSON.parse(response.body).workItems;
        for(const val of reapArray) {
            val.queryName = queryName;
            val.auth = auth;
            val.projectName = project;
        }
        //res.status(200).json(JSON.stringify(reapArray));
        res.status(200).json({ "value": reapArray });
      } else {
        res.status(response.statusCode ).json(JSON.stringify(response.message));
      }
    }
  });
}