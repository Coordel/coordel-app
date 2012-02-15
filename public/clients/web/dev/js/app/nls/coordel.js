define({
	"root": {
	  username: "Username",
	  password: "Password",
	  rememberMe: "Remember Me",
	  by: "by",
	  noDeadline: "No Deadline",
	  "noName": "No Name",
		"focus": "Tasks",
		"invitations": "Invitations",
		"project": "Worklist",
		"responsible": "Responsible",
		"participating": "Participating",
		"following": "Following",
		"task": "Task",
		"projects": "Work",
		"contacts": "People",
		"tasks": "Tasks",
		"help": "Help",
		"deliverables": "Deliverables",
		"results": "Results",
		"blockers": "Blockers",
		"blocking": "Blocking",
	  "info": "Info",
		"attachments": "Attachments",
		"attachment": "Attachment",
		"checklist": "Checklist",
		"people": "People",
		"roles": "Roles",
		"role": "Role",
		"profile": "Profile",
		"notes": "Notes",
		"streamHeader": "Stream",
		"current": "Current",
		"invited": "Invited",
		"upcoming": "Upcoming",
		"deferred": "Deferred",
		"blocked": "Blocked",
		"delegated": "Delegated",
		"myPrivate": "Private",
		"submitted": "For Approval",
		"cancelled": "Cancelled",
		"active": "Active",
		"pending": "Pending",
		pendingParticipation: "Pending Participation",
		"done": "Done",
		"you": "You",
		"unassigned": "Unassigned",
		"infoHeader": "Task Details",
		"doNotDisturb": "Do Not Disturb",
		"doNotDisturbOff": "Cancel Do Not Disturb",
		"doNotDisturbConfirmText": "Notifications will be stopped while Activated. Select VIPs not affected by Do Not Disturb.",
		"showRightColumn": "Show Right Column",
		"hideRightColumn": "Hide Right Column",
		"reply": "Reply",
		"send": "Send",
		"save": "Save",
		"ok": "Ok",
		"cancel": "Cancel",
		"select": "Select",
		"message": "Message",
		"newTask": "New Task",
		"newProject": "New Worklist",
		"newContact": "New Person",
		"issue": "Issue",
		"reuse": "Reuse",
		"notStarted": "Not Started",
		goTurbo: "Go Turbo",
	  cancelTurbo: "Cancel Turbo",
	  created: "Created",
	  updated: "Updated",
	  options: "Options",
	  preferences: "Preferences",
	  logout: "Logout",
	  deadlineCalendar: "Deadline Calendar",
		status: {
		  label: "Status",
		  INVITE: "Invited",
		  ACCEPTED: "Accepted",
		  DECLINED: "Declined",
		  PROPOSED: "Proposed",
		  AGREED: "Agreed",
		  AMENDED: "Amended",
		  LEFT:"Left",
		  CANCELLED: "Cancelled",
		  RESUMED: "Resumed",
		  PAUSED: "Paused",
		  DELETED: "Deleted",
		  DELEGATED: "Delegated",
		  DONE: "Done",
		  APPROVED: "Approved",
		  FINISHED: "Finished",
		  ISSUE: "Raised Issue",
		  CLEARED: "Cleared Issue" 
		  
		},
		turbo: {
		  "label": "Turbo",
		  "title": "Is action required?",
		  "subTitle": "Is there work you or someone can do like schedule a meeting, call someone, write something?",
		  "turboWizard": "Turbo Wizard",
		  "yes": "Yes",
		  "doText": "It will take two minutes or less",
		  "doLabel": "Do It",
		  "doConfirmText": "",
		  "doExecuteText": "Save",
		  "deferText": "I won't get to it, today",
		  "deferLabel": "Defer It",
		  "deferConfirmTitle": "Defer Task",
		  "delegateText": "Someone else should do it",
		  "delegateLabel": "Delegate It",
		  "delegateConfirmTitle": "Delegate Task",
		  "no": "No",
		  "transferText": "Transfer its attachments to another Worklist or Task",
		  "transferLabel": "Transfer",
		  "transferConfirmInstruct1": "Select Worklist or Worklist and Task to receive files",
		  "transferConfirmInstruct2": "Choose the files to transfer",
		  "transferConfirmTitle": "Transfer Attachments",
		  "transferExecuteText": "Transfer",
		  "somedayText": "Maybe later",
		  "somedayLabel": "Someday",
		  "somedayConfirmText": "This will move the task to your Someday list.",
		  "somedayConfirmTitle": "Maybe Someday",
		  "somedayExecuteText": "Someday",
		  "archiveText": "Keep it for future reference",
		  "archiveLabel": "Archive",
		  "archiveConfirmText": "This will archive the task. Retrieve it in the Archive list.",
		  "archiveConfirmTitle": "Archive Task",
		  "archiveExecuteText": "Archive",
		  "deleteText": "Get rid of it",
		  "deleteLabel": "Delete It",
		  "deleteConfirmText": "Are you sure? You won't be able to recover this Task.",
		  "deleteConfirmTitle": "Delete Task",
		  "deleteTodoConfirmText": "Are you sure? You won't be able to recover this Todo.",
		  "deleteTodoConfirmTitle": "Delete Todo",
		  "deleteExecuteText": "Delete",
		  "of": "of",
		  "skipText": "It's in the right place",
		  "skipLabel": "Leave It",
		  "oneDay": "One day",
		  "oneWeek": "One week",
		  "twoWeeks": "Two weeks",
		  "other": "Other"
		},
		"proposedSolution": "Proposed Solution",
		"addObject": {
		  project: "Add Worklist",
		  contact: "Add Person"
		},
		projectActions: {
		  edit: "Edit",
		  requiredMessage: "Required",
		  header: "Actions",
		  participate: "Participate",
		  leave: "Leave",
		  follow: "Follow",
		  unfollow: "Unfollow",
		  cancel: "Cancel",
		  pause: "Pause",
		  resume: "Resume",
		  defer: "Defer",
		  deleteProject: "Delete",
		  send: "Send",
		  decline: "Decline",
		  clear: "Clear",
		  reuse: "Reuse",
		  proposeChange: "Propose Change",
		  agreeChange: "Agree Change",
		  amendChange: "Amend Change", 
		  promote: "Promote",
		  reassign: "Reassign",
		  markDone: "Mark Done",
		  confirmText: {
		    participate: "Click Participate to agree to do Tasks in this Worklist",
		    leave: "This will permanently remove your access to this Worklist and set all of your Current Tasks in the Worklist Unassigned",
		    follow: "Click Follow to gain access to this Worklist",
		    unfollow: "Click Unfollow to remove your access to this Worklist",
		    cancel: "This will permanently Cancel the Worklist. All Tasks and Roles in the Worklist will also be Cancelled",
		    pause: "This will pause all Tasks in the Worklist",
		    resume: "This will resume all Paused Tasks in the Worklist",
		    send: "This will activate the Worklist and send Pending Tasks to the assigned People",
	      deleteProject: "This will permanently delete this Worklist",
	      decline: "This will remove access from the Worklist",
	      reuse: "Click to save this Worklist as a BlueprintWorklist for reuse in the future",
	      clear: "Clear from list",
	      proposeChange: "This will alert the Worklist Responsible that you have made changes to the Role",
	      agreeChange: "",
	      markDone: "This will mark the Worklist Done. It will cancel any undone Tasks"
		  },
		  instructions: {
		    leave: "Enter why you are leaving the Worklist",
		    unfollow: "Enter why you won't be following the Worklist any longer",
		    cancel: "Enter why you are cancelling the Worklist",
		    pause: "Enter why you are pausing the Worklist",
		    resume: "Enter why you are resuming the Worklist",
		    decline: "Enter why you are declining the Worklist"
		  }
		},
		"taskActions": {
		  "header": "Actions",
		  "submit": "Submit for Approval",
		  "return": "Return",
		  "approve": "Approve",
		  "reuse": "Reuse",
		  "raiseIssue": "Raise Issue",
		  "clearIssue": "Clear Issue",
		  "cancel": "Cancel",
		  "pause": "Pause",
		  "resume": "Resume",
		  "accept": "Accept",
		  "decline": "Decline",
		  "followProject": "Follow Worklist",
		  "acceptProject": "Accept Worklist",
		  "participateProject": "Participate in Worklist",
		  "declineProject": "Decline Worklist",
		  "proposeChange": "Propose Change",
		  "agreeChange": "Agree Change",
		  "delete": "Delete",
		  "showStream": "Show Stream",
		  "showInfo": "Show Info",
		  removeDeferDate: "Remove Defer Date",
		  confirmText: {
		    "submit": "This will Submit this Task to the Delegator or Worklist Responsible for Approval",
		    "return": "This will return the Task to the person who submitted it",
		    "approve": "This will mark the task Done",
		    cancel: "This will permanently Cancel the Task",
		    "delete": "This will permanently Delete the Task and it can't be recovered",
		    "pause": "This will Pause the task. If the task had a Deadline, it will now move with time. If you pause the Task for a day, the Deadline will be one day later than it was originally.",
		    "resume": "This will Resume the Task. If it had a Deadline, the new Deadline will be the original plus the duration of the Pause.",
		    "raiseIssue": "This will send the Task to the Delegator or Worklist Responsible to Clear the Issue",
		    "clearIssue": "This will Clear the Task Issue and return it to the Person who Raised the Issue",
		    "decline": "This will send the Task back to the Person who Delegated the Task to you",
		    "proposeChange": "This will return the Task the person who Delegated it to you to Agree, Modify or Decline your changes.",
		    "agreeChange": "This will notify the person who proposed the change or changes to the Task that you agree to the changes.",
		    reuse: "Click to configure this Task as a template for Reuse..."
		    
		  },
		  "instructions": {
		    "submit": "Enter summary of work done on this Task",
		    "return": "Enter the reason why you are returning this Task",
		    "approve": "Enter feedback on work done on this task. This is an opportunity to publicly complement the work done",
		    "cancel": "Enter the reason why you are cancelling this Task",
		    "delete": "Enter the reason why you are deleting this Task",
		    "pause": "Enter the reason why you are pausing this Task",
		    "resume": "Enter the reason why you are resuming this Task",
		    "raiseIssue": "Describe the Issue and any circumstances around it",
		    "proposedSolution": "Provide one or more possible solutions to clear the Issue",
		    "clearIssue": "Enter what was done to clear the Issue",
		    "decline": "Enter why you are declining this Task",
		    "proposeChange": "Describe the change or changes you made to the Task. If you haven't made changes, Cancel and make the changes first.",
		    "agreeChange": "Enter comments you have about the changes or details any additional changes you have made",
		    "quickEnterPrivate": "Click to quick-enter Private Tasks...",
		    reuse: ""
		    
		  }
		},
		"fileAction": {
		  deleteTip: "Delete File - if there are versions, the most recent will become Current",
		  promote: "Promote",
		  deleteFile: "Delete",
		  promoteTip: "Make this file Current",
		  deleteVersionTip: "Remove this Version permanently",
		  "upload": "Upload...",
		  "uploading": "Uploading"
		},
		"activityMessages": {
		  "task": {
		    "addBlocker": "Blocker Added"
		  }
		},
		empty: {
		  currentTitle: "No Current Tasks",
		  currentText: "See all Tasks that aren't Blocked or Deferred here",
		  invitedTitle: "No Invitations",
		  invitedText: "Manage new work here. Accept, Decline or Propose Changes to Tasks delegated to you. Agree Changes proposed to Tasks you've delegated.",
		  blockedTitle: "No Blocked Tasks",
		  blockedText: "Keep track of Tasks that are Blocked by Prerequisites that aren't ready yet",
		  deferredTitle: "No Deferred Tasks",
		  deferredText: "Keep track of Tasks you have Deferred to a later date",
		  delegatedTitle: "No Delegated Tasks",
		  delegatedText: "Keep track of Tasks you've Delegated here",
		  privateTitle: "No Private Tasks",
		  privateText: "Keep track of Tasks only you care about. All new Tasks go here unless they are added to a Worklist",
		  projectTasksTitle: "No Worklist Tasks",
		  projectTasksText: "Track all Tasks for this Worklist here",
		  turboTitle: "Turbo Complete",
		  turboText: "The list is Empty or you have Turbo'ed through the entire list. Restart to Turbo through the list again.",
		  contactTitle: "No Tasks",
		  contactText: "This Person has no Tasks in any of your Worklists",
		  noDeliverables: "No Deliverables"
		},
		"metainfo" : {
		  "follow": "Follow",
		  "participate": "Participate",
		  "invite": "From",
		  "proposed": "Proposed",
		  "agreed": "Agreed",
		  "amended": "Amended",
		  "isPrivate": "Private",
		  "issue": "Issue",
		  "paused": "Paused",
		  "declined": "Declined",
		  "cleared": "Issue Cleared",
		  "submitted": "For Approval",
		  "returned": "Returned",
		  "today": "Today",
		  "starts": "Starts",
		  "daysLeft": "days left",
		  "daysLate": "days late",
		  "dayLeft": "day left",
		  "dayLate": "day late"
		},
		"sort": {
		  "sortBy": "Sort By",
		  "groupBy": "Group By",
		  "byCreated": "Date Created",
		  "byUpdated": "Date Updated",
		  "byUsername": "Person",
		  "byTaskName": "Name",
		  "byProject": "Worklist",
		  "byTimeline": "Timeline",
		  "byDeadline": "Deadline",
		  "byPriority": "Priority",
		  "sortOptions": "Options",
		  "optShowChecklist": "Show Checklist",
		  "optDescending": "Descending",
		  "optShowDone": "Show Done"
		  
		},
		timeline: {
		  today: "Today",
		  thisWeek: "This Week",
		  thisMonth: "This Month",
		  overdue: "Overdue",
		  noDate: "No Date",
  		lastWeek: "Last Week",
  		lastMonth: "Next Month",
  		past: "Past",
  		noDate: "No Date",
	    nextWeek: "Next Week",
  		nextMonth: "Next Month",
  		future: "Future"
		},
		"deadlineHeader": {
		  "today": "Today",
		  "thisWeek": "This Week",
		  "nextWeek": "Next Week",
		  "thisMonth": "This Month",
		  "nextMonth": "Next Month",
		  "overdue": "Overdue",
		  "future": "Future",
		  "noDeadline": "No Deadline"
		},
		"sortHeader": {
		  "invites": "Invites",
		  "noProjectName": "No Worklist Name"
		},
		projectForm: {
		  phName: "Worklist name",
		  phPurpose: "Purpose...",
		  phDeadline: "Deadline...",
		  phResponsible: "Responsible...",
		  phDefer: "Defer...",
		  phRoles: "Roles...",
		  phPeople: "People...",
		  phAttachments: "Attachments...",
		  role: {
		    name: "Role Name",
		    person: "Person"
		  }
		},
		"taskForm": {
		  "phName": "Task name",
		  "phPurpose": "Purpose...",
		  "phDeadline": "Deadline...",
		  "phProject": "Worklist...",
		  "phDelegate": "Delegate...",
		  "phDefer": "Defer...",
		  "phDeliverables": "Deliverables...",
		  "phBlockers": "Blockers...",
		  "phAttachments": "Attachments...",
		  "phAddChoice": "Click to add a new Choice",
		  "titleNew": "New Task",
		  "titleEdit": "Edit Task",
		  "cancel": "Cancel",
		  "save": "Save"
		},
		projectFormTip: {
		  nameTitle: "Add Worklists here",
		  nameText: "<p>You can add Worklists at any time by pressing Add icon in the footer</p><br/><p>Click the Reuse button to start a Worklist from a Template.</p>",
		  purposeTitle: "Give the Purpose of the Worklist",
		  purposeText: "Purpose tells what the Worklist will accomplish.",
		  deadlineTitle: "Set a Deadline",
		  deadlineText: "<p>Deadline indicate when the Worklist must be completed. When Tasks are added, if they don't have a Deadline, the Worklist Deadline will be used.</p><p>Deadlines default to one week from now if left blank.</p>",
		  responsibleTitle: "Choose the Person who is responsible for this Worklist.",
		  responsibleText: "The Responsible has full authority to get the Worklist done.",
		  peopleTitle: "Add People to the Worklist",
		  peopleText: "Every Person in the Worklist has access to the Stream and can have a Role in the Worklist",
		  rolesTitle: "Add Roles to the Worklist",
		  rolesText: "Each Role in the Worklist is assigned to one Person and has at least one Task.",
		  deferTitle: "Define work on the Worklist until a later date",
		  deferText: "Defer a Worklist if you aren't ready to start working on it yet. This removes all Tasks from everyone's Current list until the Defer Date",
			attachmentsTitle: "Add an Attachment",
		  attachmentsText: "An Attachment is someone People in the Worklist need to get their Tasks done. It might be a Template, a report, or some other file"
		},
		"taskFormTip": {
		  "nameTitle": "Add Tasks here",
		  "nameText": "<p>You can add Tasks at any time by pressing the new task button in the header.</p><br/><p>Click the Reuse button to start from a Template.</p>",
		  "purposeTitle": "Give the Purpose of the Task",
		  "purposeText": "Purpose is important if you delegate this Task to someone else. It should be descriptive enough so someone else can create Deliverables",
		  "deadlineTitle": "Set a Deadline",
		  "deadlineText": "Deadlines help track when Tasks need to be completed but aren't required. If the Task is part of a Worklist and doesn't have a Deadline, the Worklist's Deadline will be used",
		  "projectTitle": "Add Task to a Worklist",
		  "projectText": "Worklists let you coordinate your work with others",
		  "delegateTitle": "Delegate to Someone",
		  "delegateText": "You can delegate a Task to anyone. This removes the Task from your Current list. If you don't add it to a Worklist, find it in your Delegated list",
		  "deferTitle": "Defer this Task to a later date",
		  "deferText": "Defer a task if you aren't ready to start working on it yet. This removes it from your Current list until the Defer Date",
		  "deliverablesTitle": "Define the Deliverables for this Task",
		  "deliverablesText": "Deliverables let you be explicit about what to do with this Task. Deliverables keep the work done on the Task where it is easy to find. Upload directly to the deliverable, see the Deliverable when it doesn't block the Task you're working on, etc",
		  "blockersTitle": "Select Tasks that Block this one",
		  "blockersText": "If you know a Deliverable from one Task has to be done before this one, it's a Blocker. Until the Blocker is ready, this Task won't show in your Current list. You can track it in the Blockers list. The instant the Blocker is ready, you will be notified.",
		  "attachmentsTitle": "Add an Attachment",
		  "attachmentsText": "An Attachment is something you need to get this Task done. It might be a Template, a report, or some other file"
		},
		taskFormInstructions: {
		  projectTitle: "Worklist Instructions",
		  projectText: "<em>Purpose</em> - describe what you want to accomplish with this Worklist<br><em>Deadline</em> - the Deadline is required and defaults to three days from now."
		},
		"taskFormSelect": {
		  "projectNoneFound": "No Worklist Found",
		  "projectAdd": "Add Worklist...",
		  "delegateNoneFound": "No Person Found",
		  "delegateAdd": "Invite Person...",
		  "deliverablesNoneFound": "No Deliverable Found",
		  "deliverablesAdd": "",
		  "blockersNoneFound": "No Worklist Found",
		  "blockersAdd": "",
		  responsibleNoneFound: "No Person Found",
		  responsibleAdd: "Invite Person...",
		  peopleNoneFound: "No Person Found",
		  peopleAdd: "Invite Person..."
		},
		"taskFormAttachments": {
		  "attachFiles": "Attach Files...",
		  "noFilesMessage": "You may attach any kind of file"
		},
		"taskFormAdd": {
		  "project": {
		    "name": "Worklist Name",
		    "purpose": "Purpose",
		    "deadline": "Deadline"
		  },
		  "contact": {
		    "firstName": "First Name",
		    "lastName": "Last Name",
		    "email": "Email"
		  },
		  "blockers": {
		    "instructions": "Select Blocking Tasks"
		  }
		},
		"deliverableSettings": {
		  "name": "Deliverable Name",
	    "instructions": "Instructions",
	    "fields": "Fields",
	    "blockers": "Blockers",
	    "details": "Details"
		},
		"deliverableFieldSettings": {
		  "name": "Field Name",
	    "defaultValue": "Default Value",
	    "size": "Size",
	    "required": "Required",
	    "choices": "Choices",
	    "choicePlaceHolder": "Click to add a Choice"
		},
		"choiceSettings": {
		  "name": "Choice Name",
		  "removeChoice": "Remove Choice",
		  "defaultOn": "Default Selected",
		  "defaultOff": "Default Not Selected"
		},
		"stream": {
		  "showProject": "Navigate to Worklist",
		  "showTask": "Navigate to Task",
		  "showContact": "Navigate to Person",
		  "headerTitle": "Full Stream",
		  "showStream": "Show Stream",
		  "showNotifications": "Show Notifications",
		  "filterStream": "Filter Stream",
		  "messages": "Messages",
  		"allActivity": "All Activity",
  		"fullStream": "Full Stream",
  		"projectStream": "Worklist Stream",
  		"taskStream": "Task Stream",
  		"contactStream": "Person Stream",
  		"backToFull": "Back to Full Stream",
  		"verbs": {
  		  "archive": {
  		    "verb":"archived",
  		    "preposition": "in"
  		  },
  		  "someday": {
  		    "verb":"saved for someday",
  		    "preposition": "in"
  		  },
  		  "post": {
  		    "verb":"added",
  		    "preposition": "to"
  		  },
  		  "update": {
  		    "verb":"updated",
  		    "preposition": "in"
  		  },
  		  "defer": {
  		    "verb":"deferred",
  		    "preposition": "in"
  		  },
  		  "complete": {
  		    "verb": "concluded",
  		    "preposition": "in"
  		  },
  		  "pause": {
  		    "verb": "paused",
  		    "preposition": "in"
  		  },
  		  "cancel": {
  		    "verb": "cancelled",
  		    "preposition": "in"
  		  },
  		  "resume": {
  		    "verb": "resumed",
  		    "preposition": "in"
  		  },
  		  "invite": {
  		    "verb": "invited",
  		    "preposition": "to"
  		  },
  		  "delegate": {
  		    "verb": "delegated",
  		    "preposition": "to"
  		  },
  		  "join": {
  		    "verb": "joined",
  		    "preposition": ""
  		  },
  		  "follow": {
  		    "verb": "followed",
  		    "preposition": ""
  		  },
  		  "accept": {
  		    "verb":"accepted",
  		    "preposition": "in"
  		  },
  		  "make-responsible": {
  		    "verb": "made responsible for",
  		    "preposition": "in"
  		  },
  		  "own": {
  		    "verb": "took responsibility for",
  		    "preposition": ""
  		  },
  		  "raise-issue": {
  		    "verb": "raised an issue with",
  		    "preposition": "in"
  		  },
  		  "clear-issue": {
  		    "verb": "cleared an issue with",
  		    "preposition": "in"
  		  },
  		  "reassign": {
  		    "verb": "reassigned",
  		    "preposition": "in"
  		  },
  		  "unassign": {
  		    "verb": "dismissed",
  		    "preposition": "in"
  		  },
  		  "assign": {
  		    "verb":"assigned",
  		    "preposition": "to"
  		  },
  		  "dismiss": {
  		    "verb": "dismissed",
  		    "preposition": "from"
  		  },
  		  "decline": {
  		    "verb": "declined",
  		    "preposition": "in"
  		  },
  		  "delete": {
  		    "verb": "deleted",
  		    "preposition": "in"
  		  },
  		  "submit": {
  		    "verb": "finished and submitted",
  		    "preposition": "to"
  		  },
  		  "return": {
  		    "verb": "returned",
  		    "preposition": "to"
  		  },
  		  "approve": {
  		    "verb": "approved",
  		    "preposition": "in"
  		  },
  		  "finish": {
  		    "verb":"finished",
  		    "preposition": "in"
  			},
  			"propose-change": {
  			  "verb": "proposed change",
  			  "preposition": "in"
  			},
  			"agree-change": {
  			  "verb": "agreed the change",
  			  "preposition": "to"
  			}
  		}
		},
		"taskDetails": {
		  "editTask": "Edit Task",
		  "declineTask": "Decline Task",
		  "acceptTask": "Accept Task",
		  "chooseAction": "Choose Task Action",
		  "reuseTask": "Reuse Task",
		  "showInfo": "Show Task Information",
		  "purpose": "Purpose",
		  "starts": "Starts",
		  "deadline": "Deadline",
		  "attachments": "Attachments",
		  "by": "By",
		  "created": "Created",
		  "from": "From",
		  "hideChecklistNotes": "Hide Checklist and Notes",
		  "showChecklistNotes": "Show Checklist and Notes",
		  "newTodo": "New todo",
		  "newNote": "New note"
		},
		projDetails: {
		  purpose: "Purpose",
		  starts: "Starts",
		  responsible: "Responsible",
		  followers: "Followers",
		  deadline: "Deadline",
		  attachments: "Attachments",
		  editProject: "Edit Worklist",
		  chooseAction: "Choose Worklist Action",
		  reuseProject: "Reuse Worklist",
		  showInfo: "Show Worklist Information",
		  hidePeopleRoles: "Hide People and Roles",
		  showPeopleRoles: "Show People and Roles",
		  instructions: {
		    quickEnterTask: "Click to quick-enter Worklist Tasks..."
		  }
		},
		"deliverable": {
		  "emptyTitle": "No Deliverables",
		  "emptyDescription": "Click Edit to add Deliverables or click Done when you finish the Task",
		  "uploadLabel": "Upload ..."
		},
		"taskWorkspace": {
		  "nextButtonText": "Next Step ...",
		  "save": "Save",
		  "total": "Total",
		  "blocked": "Blocked",
		  "recentVersions": "Recent Versions",
		  "allVersions": "All Versions",
		  "showAllVersions": "Show All Versions",
		  "showRecentVersions": "Show Recent Versions",
		  "blockMessage": "Required. Task blocks until the Deliverable has a value."
		},
		"timeago": {
		  prefixAgo: null,
      prefixFromNow: null,
      suffixAgo: "ago",
      suffixFromNow: "from now",
      seconds: "< 1 min",
      minute: "1 min",
      minutes: "%d mins",
      hour: "1 hr",
      hours: "%d hrs",
      day: "1 day",
      days: "%d days",
      month: "1 mon",
      months: "%d mons",
      year: "1 yr",
      years: "%d yrs",
      numbers: []
		}
	},
	"fr-fr":true
});