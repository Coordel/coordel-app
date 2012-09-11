module.exports = [
    {
       "_id": "180efe932ec61ff0fec30a70af1e4081",
       "docType": "template",
       "templateType": "deliverable",
       "multipart": false,
       "fields": [
           {
               "default": "10002",
               "required": false,
               "primitiveType": "string",
               "label": "Checkbox List",
               "fieldType": "checkbox",
               "position": "full",
               "order": "0",
               "children": [
                   {
                       "id": "10001",
                       "value": false,
                       "label": "Option 1"
                   },
                   {
                       "id": "10002",
                       "value": true,
                       "label": "Option 2"
                   },
                   {
                       "id": "10003",
                       "value": true,
                       "label": "Option 3"
                   }
               ],
               "size": "medium"
           }
       ],
       "instructions": "Select one or more options",
       "id": "180efe932ec61ff0fec30a70af1dc983",
       "name": "Checkbox List",
       "organization": "coordel.com",
       "isPublic": true,
       "isDefault": true,
       "created": "2010-01-01"
    },
    {
       "_id": "180efe932ec61ff0fec30a70af1e242b",
       "docType": "template",
        "templateType": "deliverable",
       "multipart": false,
       "fields": [
           {
               "value": "1002",
               "default": "1001",
               "required": false,
               "primitiveType": "string",
               "label": "Dropdown List",
               "fieldType": "select",
               "position": "full",
               "order": "0",
               "children": [
                   {
                       "id": "1001",
                       "label": "Option 1",
                       "value": false
                   },
                   {
                       "id": "1002",
                       "label": "Option 2",
                       "value": true
                   },
                   {
                       "id": "1003",
                       "label": "Option 3",
                       "value": false
                   }
               ],
               "size": "medium"
           }
       ],
       "instructions": "Select one",
       "id": "180efe932ec61ff0fec30a70af1db733",
       "name": "Dropdown List",
       "organization": "coordel.com",
       "isPublic": true,
       "isDefault": true,
       "created": "2010-01-01"
    },
    {
       "_id": "180efe932ec61ff0fec30a70af1e3609",
       "docType": "template",
        "templateType": "deliverable",
       "multipart": false,
       "fields": [
          {
              "value": "",
              "default": "file field",
              "required": false,
              "primitiveType": "url",
              "label": "File",
              "fieldType": "input",
              "id": "unique",
              "position": "full",
              "order": "0",
              "inputType": "file",
              "size": "large",
              "data": {
                  "ready": false,
                  "variables": [
                  ]
              }
          }
       ],
       "instructions": "Upload deliverable file here",
       "id": "180efe932ec61ff0fec30a70af1dc4ae",
       "name": "File",
       "organization": "coordel.com",
       "isPublic": true,
       "isDefault": true,
       "created": "2010-01-01"
    },
    {
       "_id": "180efe932ec61ff0fec30a70af1e4cea",
       "docType": "template",
        "templateType": "deliverable",
       "multipart": false,
       "fields": [
           {
               "default": "100002",
               "required": false,
               "primitiveType": "string",
               "label": "Checkbox List",
               "fieldType": "radio",
               "position": "full",
               "order": "0",
               "children": [
                   {
                       "id": "100001",
                       "value": false,
                       "label": "Option 1"
                   },
                   {
                       "id": "100002",
                       "value": true,
                       "label": "Option 2"
                   },
                   {
                       "id": "100003",
                       "value": false,
                       "label": "Option 3"
                   }
               ],
               "size": "medium"
           }
       ],
       "instructions": "Select one",
       "id": "180efe932ec61ff0fec30a70af1dcf4a",
       "name": "Radio List",
       "organization": "coordel.com",
       "isPublic": true,
       "isDefault": true,
       "created": "2010-01-01"
    },
    {
       "_id": "180efe932ec61ff0fec30a70af1d90c3",
       "multipart": false,
       "fields": [
           {
               "value": "",
               "versions": [
               ],
               "default": "",
               "required": false,
               "primitiveType": "string",
               "label": "Text Box",
               "fieldType": "input",
               "inputType": "text",
               "position": "full",
               "order": "0",
               "size": "medium",
               "invalidMessage": "",
               "mustValidate": false,
               "singleSave": false
           }
       ],
       "instructions": "Enter a value",
       "id": "180efe932ec61ff0fec30a70af1d9ac1",
       "name": "Text Box",
       "organization": "coordel.com",
       "docType": "template",
       "templateType": "deliverable",
       "isPublic": true,
       "isDefault": true,
       "created": "2010-01-01"
    },
    {
       "_id": "180efe932ec61ff0fec30a70af1e10c0",
       "docType": "template",
        "templateType": "deliverable",
       "id": "180efe932ec61ff0fec30a70af1db23c",
       "multipart": false,
       "fields": [
           {
               "value": "",
               "versions": [
               ],
               "default": "",
               "required": false,
               "primitiveType": "string",
               "label": "Textarea",
               "fieldType": "textarea",
               "position": "full",
               "order": "0",
               "size": "medium"
           }
       ],
       "instructions": "Enter text",
       "name": "Textarea",
       "organization": "coordel.com",
       "isPublic": true,
       "isDefault": true,
       "created": "2010-01-01"
    }
  ];