require('date-utils');

var settings    = require('./../settings'),
    couchOpts   = settings.config.couchOptions,
    cradle      = require('cradle').setup(couchOpts),
    cn          = new cradle.Connection(),
    db          = cn.database(settings.config.couchName);

var Project = exports = module.exports = function Project(args){

  this.assignments = args.assignments;
  this.created = args.created || (new Date()).toUTCString();
  this.creator = args.creator;
  this.deadline = args.deadline || (new Date()).addDays(7);
  this.docType = 'project';
  this.history = args.history || [];
  this.isMyDelegated = args.isMyDelegated || false;
  this.isNew = args.isNew || true;
  this.isTemplate = args.isTemplate || false;
  this.name = args.name || 'No Name';
  this.purpose = args.purpose || 'WARNING: no purpose was provided. Why is that?';
  this.responsible = args.responsible;
  this.status = args.status || "ACTIVE";
  this.substatus = args.substatus || "PENDING";
  this.users = args.users;
};

Project.prototype.add = function(fn){
  
  if (this.assignments && this.creator && this.responsible && this.users){
    console.log('adding project to couchdb store', this);
    
  } else {
    fn('CoordelApp is not valid. id, email, firstName, lastName, ' +
        'myDelegatedProject, myPrivateProject, and myPrivateRole are all required', false);
  }
};

