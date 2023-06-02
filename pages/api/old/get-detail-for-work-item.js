const request = require('request');

export default async function handler(req, res) {

  const urlLocal = req.body.url;
  const queryName = req.body.queryName;
  const auth = req.body.auth;
  const projectName = req.body.projectName
  
  var url = urlLocal;

  url += '?api-version=6.0';
  url += '&Authorization=Basic BASE64PATSTRING';

  //console.log(url);


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
      if (response.statusCode === 200) {

        const body = JSON.parse(response.body);
        const editLink = body._links.html.href;
        const fields = body.fields;
        const workItemType = fields["System.WorkItemType"];
        const state = fields["System.State"];
        const assignedToName = fields["System.AssignedTo"]["displayName"];
        const assignedToEmail = fields["System.AssignedTo"]["uniqueName"];
        const title = fields["System.Title"];
        const priority = fields["Microsoft.VSTS.Common.Priority"];
        const severity = fields["Microsoft.VSTS.Common.Severity"];
        const releaseNumber = fields["Custom.ReleaseNumber"];
        const responsible = fields["Custom.Responsible"];
        const system = fields["Custom.System"];

        const resp = {
            body,
            editLink,
            workItemType,
            state,
            assignedToName,
            assignedToEmail,
            title,
            priority,
            severity,
            releaseNumber,
            responsible,
            system,
            queryName,
            projectName
        };

        res.status(200).json(resp);
      } else {
        res.status(response.statusCode ).json(JSON.stringify(response.message));
      }
    }
  });
}