angular.module('Today.controller', ['config', 'starter.services'])

.controller('TodayCtrl', function($scope, ENV, $location, $http, $rootScope, User, Adherence, Treatment, Patient, Cycle, uiCalendarConfig, $timeout, moment, Survey, $state) {


  if(typeof sessionStorage['token'] === 'undefined'){
    $state.go('login')
  }




    $scope.date = new Date(); 
    
    $scope.noDosageFreeChoiceQuestionResponse =""; 

    $scope.postAdherenceNoReason = function(reason){
      Survey.postSurveyReply(reason).then(function(response){    
        $scope.cancel()
      }); 
    }


    $scope.loadingDayCalendar = true;
    $scope.dailyCalLoading = "dailyCalLoading"
    

    var loadingFunction = function() {
      $scope.dailyCalLoading = ""
      $scope.loadingDayCalendar = false;

    }





    Date.prototype.addHours = function(h) {
      this.setHours(this.getHours() + h);
      return this;
    }

    Date.prototype.addMins = function(m) {
      this.setMinutes(this.getMinutes() + m);
      return this;
    }



    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();



    $scope.createEatAndSleepCalendarEvents = function(patientSchedule, dateForEvent) {
      var day = dateForEvent.getDate();
      var month = dateForEvent.getMonth();
      var year = dateForEvent.getFullYear();

      for (var i = 0; i < patientSchedule.length; i++) {
        var time = patientSchedule[i].time.split(":")
        var eventTitle;
        if (patientSchedule[i].label) {
          var eventTitle = patientSchedule[i].label.replace(/^[a-z]/, function(m) {
            return m.toUpperCase()
          })
          $scope.eatEventsFortoday = {
            title: eventTitle,
            start: new Date(year, month, day, time[0], time[1]),
            // end: new Date(y, m, d, Number(time[0]) + 1, time[1]),
            allDay: false,
            // overlap: false
            timeFormat: 'H:mm-{H:mm}',
            description: ""
          }
          if ($scope.eventSources[1].events.indexOf($scope.eatEventsFortoday) === -1) {
            $scope.eventSources[1].events.push($scope.eatEventsFortoday)
          }

        } else {
          var eventTitle = patientSchedule[i].item.replace(/^[a-z]/, function(m) {
            return m.toUpperCase()
          })
          $scope.sleepEventsFortoday = {
            title: eventTitle,
            start: new Date(year, month, day, time[0], time[1]),
            // end: new Date(y, m, d, Number(time[0]) + 1, time[1]),
            allDay: false,
            description: ""
              // overlap: false
          }
          if ($scope.eventSources[1].events.indexOf($scope.sleepEventsFortoday) === -1) {
            $scope.eventSources[1].events.push($scope.sleepEventsFortoday)
          }
        }
      };
    }



    $scope.TreatmentsForToday = [];
    $scope.times = [];



    //////////////////////////////////////Begin Getting Drug Events//////////////////////////////////////////////////////////

    $scope.createDrugEventsforWeek = function(treatmentBundles, dateForEvent) {



      for (var i = 0; i < treatmentBundles.length; i++) {
        var currentSurvey,
          surveyId;
        if (treatmentBundles[i].status === "discontinued" || treatmentBundles[i].status === "pending") {
          continue;
        }

        $scope.adherenceSurveys.forEach(function(el) {


          if (el.targetId === "adherence__" + treatmentBundles[i]._id) {
            currentSurvey = el
            surveyId = el._id


          }
        })



        for (var j = 0; j < treatmentBundles[i].drug.usages.length; j++) {
          var instructions = [];
          var timeConstraints = [];
          for (var p = 0; p < treatmentBundles[i].drug.instructions.length; p++) {
            instructions.push(treatmentBundles[i].drug.instructions[p].additionalInfo || treatmentBundles[i].drug.instructions[p].type);
            if (treatmentBundles[i].drug.instructions[p].timeConstraints !== undefined) {
              for (var c = 0; c < treatmentBundles[i].drug.instructions[p].timeConstraints.deltas.length; c++) {
                if (treatmentBundles[i].drug.instructions[p].timeConstraints.deltas[c].value !== undefined) {
                  if (treatmentBundles[i].drug.instructions[p].timeConstraints.deltas[c].occurence === 'before') {
                    var timeContaraintObjects = {
                      value: treatmentBundles[i].drug.instructions[p].timeConstraints.deltas[c].value / -60,
                      occurence: treatmentBundles[i].drug.instructions[p].timeConstraints.deltas[c].occurence
                    }
                  } else {
                    var timeContaraintObjects = {
                      value: treatmentBundles[i].drug.instructions[p].timeConstraints.deltas[c].value / 60,
                      occurence: treatmentBundles[i].drug.instructions[p].timeConstraints.deltas[c].occurence
                    }

                  }
                  timeConstraints.push(timeContaraintObjects)
                }
              }
            }
          }
          for (var g = 0; g < treatmentBundles[i].drug.usages[j].tick.length; g++) {
            if (!treatmentBundles[i].drug.usages[j].tick[g].scheduleDates) {
              continue;
            }
            for (var h = 0; h < treatmentBundles[i].drug.usages[j].tick[g].scheduleDates.length; h++) {
              if (treatmentBundles[i].status === "onhold") {
                if (new Date(new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h])) > new Date(treatmentBundles[i].heldAt)) {
                  continue;
                }

              }
              if (new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]).toDateString() === dateForEvent.toDateString()) {

                var surveyQuestions = []
                

          if(currentSurvey && currentSurvey !== undefined){


                for(var  z = 0; z < currentSurvey.questions.length; z++){
                  if (currentSurvey.questions[z].scheduleDates[0] !== undefined && currentSurvey.questions[z].scheduleDates[0].date === treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]) {
                    surveyQuestions.push(currentSurvey.questions[z])

                  }

              

                }
                 }

                 if(surveyQuestions.length > 0){


                for(var t=0; t<surveyQuestions.length; t++){

        
            if(surveyQuestions[t]._type === "DosageChoiceQuestion"){
         var sorted = surveyQuestions[t].scheduleDates[0].replies.sort(function(a,b){

          return new Date(a.submitted) - new Date(b.submitted)

         })
         var mostRecentResponse = sorted.pop()
         
       }
     }
     }


                var drugTime = {
                  name: treatmentBundles[i].name,
                  time: new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]),
                  colorClass: "colorclass" + i,
                  abbreviation: treatmentBundles[i].name.substring(0, 2),
                  surveyQuestions: surveyQuestions,
                  surveyId: surveyId, 
                  mostRecentAnswer: mostRecentResponse

                }

                

                $scope.TreatmentsForToday.push(treatmentBundles[i])
                $scope.times.push(drugTime)
                $scope.drugsToday = {
                  title: treatmentBundles[i].name,
                  start: new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]),
                  // end: new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]).addHours(1),
                  allDay: false,
                  colorClass: "colorclass" + i,
                  description: "Take " + treatmentBundles[i].drug.usages[j].tick[g].strength + treatmentBundles[i].drug.measure + " " + instructions[0],
                  surveyQuestions: surveyQuestions,
                  surveyId: surveyId, 
                  mostRecentAnswer: mostRecentResponse

                }
                for (var t = 0; t < timeConstraints.length; t++) {
                  if (timeConstraints[t].occurence === 'before') {
                    $scope.timeConstraintsBefore = {
                      title: "Go " + instructions[0] + "  from " + new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]).addHours(timeConstraints[t].value).toLocaleTimeString(navigator.language, {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) + " to " + new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]).toLocaleTimeString(navigator.language, {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) + " " + timeConstraints[t].occurence + " taking " + treatmentBundles[i].name,
                      start: new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]).addHours(timeConstraints[t].value),
                      end: new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]),
                      allDay: false,
                      description: ""
                    }
                    $scope.eventSources[3].events.push($scope.timeConstraintsBefore)
                  } else if (timeConstraints[t].occurence === 'after') {
                    $scope.timeConstraintsAfter = {
                      title: "Go " + instructions[0] + "  from " + new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]).toLocaleTimeString(navigator.language, {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) + " to " + new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]).addHours(timeConstraints[t].value).toLocaleTimeString(navigator.language, {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) + " " + timeConstraints[t].occurence + " taking " + treatmentBundles[i].name,
                      start: new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]).addMins(1),
                      end: new Date(treatmentBundles[i].drug.usages[j].tick[g].scheduleDates[h]).addHours(timeConstraints[t].value),
                      allDay: false,
                      description: ""
                    }
                    $scope.eventSources[3].events.push($scope.timeConstraintsAfter)
                  }
                }
                $scope.eventSources[2].events.push($scope.drugsToday)
              }
            }
          }
        }
      }
      $timeout(loadingFunction, 1)

    }


    $scope.getChecklists = function(TreatmentBundles, date) {
      var startDate = moment(date).subtract(1, 'days').startOf("month").format()
      var endDate = moment(date).endOf("month").format()

      for (var i = 0; i < TreatmentBundles.length; i++) {
        var bundleId = TreatmentBundles[i]._id;
        var title = TreatmentBundles[i].name
        Cycle.getCurrentStepsForBundle($rootScope.userID, startDate, endDate, bundleId, title).then(function(checkList) {

          if (checkList.steps.length) {
            checkList.steps = checkList.steps.filter(function(step) {

              if (step.cycles.assigned) {
                for (var j = 0; j < step.cycles.tasks.length; j++) {
                  $scope.obj = {
                    title: null,
                    start: null,
                    allDay: true,
                    task: null,
                    onCompleteList: null,
                    notes: null,
                    description: "+",
                    id: j,
                    colorClass: "taskClass"
                  }

                  $scope.obj.description = ""


                  if (!step.cycles.tasks[j]) {
                    continue;
                  }


                  
                  if (!step.cycles.tasks[j].date || !step.cycles.tasks[j].date.length) {
                    step.cycles.tasks[j].date = step.cycles.date[0]

                  }
                  
                  if (step.cycles.tasks[j].status.name === "Complete") {

                    $scope.obj.onCompleteList = true
                  }
                  if (step.cycles.tasks[j].assigned && step.cycles.tasks[j].assigned._id === $scope.userProfile._id) {
                    $scope.obj.title = "Task Due: " + step.name + "-" + step.cycles.tasks[j].title
                    $scope.obj.start = new Date(step.cycles.tasks[j].date)
                    $scope.obj.task = step.cycles.tasks[j]



                    $scope.eventSources[0].events.push($scope.obj)



                  }
                }

                return true
              } else {
                return false
              }

            })


          }
        })
      }
    }; 
    ///////////////////////////// Get Adherence function/////////////////////////////////

    var makeAdherenceCall = function(patientId, dateForEvent) {
      var fromSurveyDate = moment(dateForEvent).format("YYYY-M-DD"),
          untilSurveyDate = moment(dateForEvent).add(1, "days").format("YYYY-M-DD");
      Adherence.getAdherenceOneDay($rootScope.userID, fromSurveyDate, untilSurveyDate).then(function(result) {
        $scope.adherenceSurveys = result.data.data
      })
    }
    ////////////////////////End Of Getting Drugs //////////////////////////////////////////////

    User.getCurrentUser().then(function(user) {
      $scope.userProfile = user.data.data; 
      $rootScope.userID = user.data.data.patientProfiles[0]; 
      makeAdherenceCall($rootScope.userID, date); 
      Treatment.getTreatmentScheduleForOneDay(user.data.data.patientProfiles[0], y, m, d).then(function(treatments) {
        $scope.treatments = treatments.data.data
        $scope.getChecklists($scope.treatments, date)
        Patient.getCurrentPatientInformation(user.data.data.patientProfiles[0]).then(function(patient) {
          $scope.patientSchedule = patient.data.data.schedule
          $scope.createEatAndSleepCalendarEvents($scope.patientSchedule, date)
          $scope.createDrugEventsforWeek($scope.treatments, date)
        }); 
      }); 
    }); 


    $scope.eventSources = [{
        events: [],
        color: "transparent", // an option!
        textColor: 'black',
        className: 'task' // an option!
      },

      {
        events: [],
        color: "transparent", // an option!
        textColor: 'black', // an option!
        className: 'dailySchduale',
      },

      {
        events: [],
        color: "transparent",
        textColor: 'black',
        className: 'drugs'
      },

      {
        events: [],
        color: "transparent",
        borderColor: '#ff4081', // an option!
        textColor: 'black',
        className: 'timeConstraints'
      }
    ]

    $scope.taskClick = function(event, element) {
      if (event.task) {
        if (event.task.status.name !== "Complete") {
          event.task.status.name = "Complete"
          $('.task .fc-event-title').each(function() {
            if ($(this).text() === event.title) {
              $(this).removeClass("glyphicon glyphicon-unchecked taskUnchecked").css('color', 'black');
              $(this).addClass("glyphicon glyphicon-check taskCheck").css('color', 'green');
            }
          })
        } else {
          event.task.status.name = "Open"
          $('.task .fc-event-title').each(function() {
            if ($(this).text() === event.title) {
              $(this).removeClass("glyphicon glyphicon-check taskCheck").css('color', 'green');
              $(this).addClass("glyphicon glyphicon-unchecked taskUnchecked").css('color', 'black');
            }
          })
        }
        $http.put(ENV.apiUrl + "/task/" + event.task._id, event.task).then(function(res){}); 
      }
    }

    
    /* config calendar view  */
    $scope.uiConfig = {
      calendar: {
        defaultView: "basicDay",
        // viewRender: function(view, element) {
        //   $scope.calendarFunctions = view.calendar

        // },
        // editable: true,
        header: {
          left: '',
          center: '',
          right: '',
        },
        eventClick: $scope.taskClick,

        eventRender: function(event, element) {



       

          if (element[0].className.indexOf('task') !== -1) {
            if (event.task.status.name !== "Complete") {


              // element.find('div').append('<span class="' + "dailyButtonView" + '">' + event.description + '</span>');

              element.find('span').addClass("taskUnchecked glyphicon glyphicon-unchecked ").css('color', 'black');
            } else if (event.task.status.name === "Complete") {
              element.find('span').addClass("glyphicon glyphicon-check ").css('color', 'green');


            }
          } 

          if (element[0].className.indexOf('timeConstraints') !== -1) {
            return 

          }

          else {


            var colorClass = event.colorClass || ""

            if(event.mostRecentAnswer !== undefined){
              if(event.mostRecentAnswer.value.response === "YES"){
               
                  element.find('div').append('<span class="ion-checkmark-circled yesResponse"></span>' )

                    return 
              }

                    else  if(event.mostRecentAnswer.value.response === "NO"){
                
                  element.find('div').append('<span class="ion-close-circled noResponse"></span>' )

                    return 
              }
            }


            element.find('div').append("<br>"+'<span class="dailyInstruc">' +event.description+ '</span>' +"<br><div class = 'yesNoButtons'><button id='buttonYes' class='button button-balanced'>Yes</button>&nbsp;&nbsp;&nbsp;&nbsp;<button id='buttonNo' class='button button-assertive'>No</button></div><br><br>")
            element.find('#buttonYes').click(function() {
              element.find(".fc-event-title").append('<span class="ion-checkmark-circled yesResponse"></span>' )
              element.find('.yesNoButtons').remove()
              var question;
              for(var i = 0; i< event.surveyQuestions.length; i++){
                if(event.surveyQuestions[i]._type === "DosageChoiceQuestion"){
                    question = event.surveyQuestions[i]
                }
              }

              
              
              var surveyResponse = {
                survey: event.surveyId,
                question: question._id,
                session: "anytime",
                patient: $rootScope.userID,
                submitted: new Date(),
                submittedFor: question.scheduleDates[0].date,
                value: {response: "YES", 
                        reason: ""},
                score: 10
              }

              Survey.postSurveyReply(surveyResponse).then(function(result){
 
              })

            })

            element.find('#buttonNo').click(function() {
              element.find(".fc-event-title").append('<span class="ion-close-circled noResponse"></span>' )
              element.find('.yesNoButtons').remove()

              var question, 
              reasonQuestion; 
              for(var i = 0; i< event.surveyQuestions.length; i++){
                  if(event.surveyQuestions[i]._type === "DosageChoiceQuestion"){
                      question = event.surveyQuestions[i]
                      question.surveyId = event.surveyId
                      question.BundleName = event.title
                  }
              }
              var surveyResponse = {
                survey: event.surveyId,
                question: question._id,
                session: "anytime",
                patient: $rootScope.userID,
                submitted: new Date(),
                submittedFor: question.scheduleDates[0].date,
                value: {response: "NO", 
                        reason: ""},
                score: 0
              }; 
              question.surveyResponse = surveyResponse; 
               Survey.postSurveyReply(surveyResponse).then(function(result){
 
              })
            }); 
          }
        },
        timeFormat: 'hh:mm tt'
      }
    };

  });