import express from 'express';
import Zoho from 'zoho';
import _ from 'lodash';
import request from 'request';
import chalk from 'chalk';
import bodyParser from 'body-parser'

const router = express.Router();
const Token = 'INSERT TOKEN HERE';
const crm = new Zoho.CRM({
    authtoken: Token
});

// create application/json parser 
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser 
var urlencodedParser = bodyParser.urlencoded({ extended: false })

router.get('/', (req, res) => {
    res.send('index')
});

router.post('/contact/create', jsonParser, function (req, res) {
    let dataResp = {}
    let result = {}

    const firstName = req.body.contact_first_name
    const lastName = req.body.contact_last_name
    const email = req.body.contact_email
    const phone = req.body.contact_phone
    const description = req.body.contact_description

    const myXMLText = `<Contacts>
    <row no="1">
    <FL val="First Name">`+firstName+`</FL>
    <FL val="Last Name">`+lastName+`</FL>
    <FL val="Email">`+email+`</FL>
    <FL val="Phone">`+phone+`</FL>
    <FL val="Description">`+description+`</FL>
    </row>
    </Contacts>`

    request({
        url: "https://crm.zoho.com/crm/private/json/Contacts/insertRecords?authtoken="+Token+"&scope=crmapi&xmlData="+myXMLText,
        method: "POST",
        headers: {
            "content-type": "application/xml"
        },
        body: myXMLText
    }, function (error, response, body){
        let contactId = ''
        dataResp = JSON.parse(body)
        if(dataResp.response.hasOwnProperty("result")){
            dataResp = dataResp.response.result.recorddetail
            _(dataResp.FL).forEach(function(value) {
                if(value.val == 'Id'){
                    contactId = value.content
                }
            });
            result = {
                successfully_created : true,
                contact_id : contactId
             }
        }else{
            result = {
                successfully_created : false,
             }
        }
        res.send(result);
    });
});

router.post('/case/create', jsonParser, function (req, res) {
    let dataResp = {}
    let result = {}

    const contactId = req.body.contact_id
    const caseDescription = req.body.case_description
    const caseSubject = req.body.case_subject
    const caseStatus = req.body.case_status
    const caseOrigin = req.body.case_origin
    const emailEjecutivo = req.body.case_email_ejecutivo

    const myXMLText = `<Cases>
    <row no="1">
    <FL val="Case Origin">${caseOrigin}</FL>
    <FL val="Status">${caseStatus}</FL>
    <FL val="Subject">${caseSubject}</FL>
    <FL val="Description">${caseDescription}</FL>
    <FL val="Email Ejecutivo">${emailEjecutivo}</FL>
    <FL val="WHOID">${contactId}</FL> 
    </row>
    </Cases>`

    request({
        url: "https://crm.zoho.com/crm/private/json/Cases/insertRecords?authtoken="+Token+"&scope=crmapi&xmlData="+myXMLText,
        method: "POST",
        headers: {
            "content-type": "application/xml"
        },
        body: myXMLText
    }, function (error, response, body){
        let caseID = ''
        dataResp = JSON.parse(body)
        if(dataResp.response.hasOwnProperty("result")){
            dataResp = dataResp.response.result.recorddetail
            _(dataResp.FL).forEach(function(value) {
                if(value.val == 'Id'){
                    caseID = value.content
                }
            });
            result = {
                successfully_created : true,
                case_id : caseID
            }
        }else{
            result = {
                successfully_created : false,
                error: body
            }
        }
        res.send(result);
    });
});

router.get('/contact/:phone_number', (req, res) => {
    let dataResp = {}
    let result = {}

    request('https://crm.zoho.com/crm/private/json/Contacts/searchRecords?authtoken='+Token+'&scope=crmapi&criteria=(Mobile:'+req.params.phone_number+')', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        dataResp = JSON.parse(body)
        if(dataResp.response.hasOwnProperty("result")){
            let contactId = ''
            dataResp = dataResp.response.result.Contacts.row
            _(dataResp.FL).forEach(function(value) {
                if(value.val == 'CONTACTID'){
                    contactId = value.content
                }
            });
            result = {
                already_exists : true,
                contact_id : contactId
            }
        } else {
            result = {
                already_exists : false
            }
        }
      }
      res.json(result)
    })
});

router.get('/contactlist', (req, res) => {
    let dataResp = []
    crm.getRecords('contacts', function (err, data) {
          if (err) {
            dataResp = err
          }else{
            dataResp = data
            dataResp = dataResp.data
          }  
          res.json({"data":dataResp})
    });
});


export default router;
