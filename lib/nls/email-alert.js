module.exports = {

    features: {
      productivity: {
        p1: {
          feature: "deadline calendar",
          headline: "Track all deadlines in one place",
          description: "Rather than making an entry in your calendar when you need to do something, Coordel automatically organizes all of your Tasks into one place. All Coords have a deadline. Tasks can have deadlines, but if they don't, they get the deadline of the Coord. Deadlines help avoid confusion. When something is due at 2:00 this afternoon, everyone knows what that means. No more my priority isn't the same as your priority!"
        },
        p2: {
          feature: "explicit invitations",
          headline: "Agree or decline new work requests",
          description: "Rather than miscommunicating about what you will or won't do, Coordel allows you to accept or decline new work."
        },
        p3: {
          feature: "explict issue handling",
          headline: "Raise and Clear Issues in real time",
          description: "Avoid miscommunication when you discover an Issue. Coordel let's you easily raise an issue with the Task. Ownership transfers immediately to the Responsible to Clear it."
        },
        p4: {
          feature: "explicit done",
          headline: "Submit Done Tasks and get Agreement from the Responsible",
          description: "Rather than think you're done and find out later you're not, Coordel provides a built-in agreement process so everyone knows work is done."
        },
        p5: {
          feature: "stream",
          headline: "Spend your time doing work, not writing about it",
          description: "Rather than worrying about who needs to be informed about what you're doing, Coordel does the work for you. Take action and Coordel will immediately inform everyone who matters. Need to see what happened, easily see the Task or Coord stream right where you expect them to be."
        },
        p6: {
          feature: "current tasks",
          headline: "Control your work",
          description: "Rather than worrying about what you've agreed to do, Coordel will keep track, and more. Only those Tasks that you can work on will be in your Current list. That way, you can decide what you need to do now."
        },
        p7: {
          feature: "deferred tasks",
          headline: "Control when you start work",
          description: "Avoid confusion about when you'll start to do your work. Set the defer date to when you intend to start work on the Task and everyone who matters will be notified. That way, if there are any problems, they can get raised right away."
        },
        p8: {
          feature: "delegated tasks",
          headline: "Remember who you've asked to do work",
          description: "Coordel distributes authority and responsiblility widely as possible. Sometimes, you are the expert and will do the work. Sometimes, you're not and will ask someone else to do it. With Coordel you can easily track your delegated tasks"
        },
        p9: {
          feature: "blocked tasks",
          headline: "Set it and forget it",
          description: "Rather than sending e-mails and making phone calls to find out if someone is done with work you're waiting for, Coordel let's you set what's blocking you."
        },
        p10: {
          feature: "private tasks",
          headline: "Sometimes, only you care",
          description: "When you need to do something that doesn't affect someone else, drop it into your Private list."
        },
        p11: {
          feature: "turbo wizard",
          headline: "Get your day started",
          description: "Don't get overwhelmed by the work on your plate. Turbo through it by choosing one of three actions: do it, delegete it, or defer it . . . and you're done."
        } 
      },
      opportunity: {
        
      }
    },
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
		    "verb": "concluded coord",
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
		    "preposition": "to",
		    "meaning": "%person% invited you to work together on %Coord/Task% on Coordel",
		    "actionRequired": "Sign in to Coordel to Accept or Decline the Invitation",
		    "link": "http://coordel.com/invite/1",
		    "features": ["p1"]
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
		  "unfollow": {
		    "verb": "unfollowed",
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
		    "verb": "cleared the issue with",
		    "preposition": "in"
		  },
		  "reassign": {
		    "verb": "reassigned",
		    "preposition": "in"
		  },
		  "unassign": {
		    "verb": "unassigned",
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
			},
			"leave": {
			  "verb": "left",
			  "preposition": ""
			},
			"feedback": {
			  "verb": "gave feedback",
			  "preposition": "in"
			},
			"ack": {
			  "verb": "acknowledged cancel",
			  "preposition": "in"
			},
			"add-blocking": {
			  "verb": "added as blocking",
			  "preposition": ""
			},
			"remove-blocking": {
			  "verb": "removed from blocking",
			  "preposition": ""
			}
		}
 
};

