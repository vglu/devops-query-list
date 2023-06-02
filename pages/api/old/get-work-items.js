const rp = require('request-promise');

export default async function handler(req, res) {
  const resp = [];
  try {
    const projects = await getProjectList();
    for (let project of projects) {
      const items = await callGetWorkItemsList(project);
      for (let workItem of items.value) {
        const item = await callGetWorkItem(workItem);
        //("item ========>>>");
        //console.log(item);
        resp.push(item);
      }
    }
  } catch (err) {
    console.log(err);
  }

  res.status(200).json(resp);
}

async function getProjectList() {

  const url = "http://localhost:3000/api/get-projects-list";

  const options = {
    method: "GET",
    url: url,
  };

  try {
    const projects = await rp(url, options);

    const ret = JSON.parse(projects);
    //console.log(ret.projects);
    return ret.projects;
  } catch (error) {
    return console.error(error);
  }
}

async function callGetWorkItemsList(project) {
  try {
    const items = await getWorkItemsList(project);
    return items;
  } catch (error) {
    return console.error(error);
  }
}

async function getWorkItemsList(project) {

  const url = "http://localhost:3000/api/get-workItems-for-project";
  const body = project;
  const options = {
    method: "GET",
    url,
    body,
    json: true,
  };

  try {
    const response = await rp(url, options);
    //const value = response.body.value;
    const value = response;
    //console.log(value);
    return value;
  } catch (error) {
    return console.error(error);
  }
}


async function callGetWorkItem(item) {
  try {
    const value = await getWorkItem(item);
    return value;
  } catch (error) {
    return console.error(error);
  }
}

async function getWorkItem(item) {
  const url = "http://localhost:3000/api/get-detail-for-work-item";
  var options = {
    method: "GET",
    url: url,
    body: item,
    json: true
  };

  try {
    const response = await rp(url, options);
    const value = response;
    //console.log(value);
    return value;
  } catch (error) {
    return console.error(error);
  }
}
