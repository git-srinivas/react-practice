(function() {
  'use strict';

  angular
    .module('payeeadmin')
    .controller('SubmissionDetailsController', SubmissionDetailsController);

  /** @ngInject */
  function SubmissionDetailsController($scope, $rootScope, $log, $state, $stateParams, $uibModal, moment, notify, _, Payee, PayeeSubmission, PayeeService, PayeeServiceDPE, ESB, Tag, ESB_ACCOUNT_STATUS, ESB_OCISS_STATUS,Admin,RoleTag,Storage, Upload,upload,AuditService,$window,SubmissionFile) {


    var vm = this;
    vm.API_URL = window.API_URL;
    vm.submission_id = $stateParams.id;
    vm.view_path = 'app/modules/submissions/';
    vm.data = null;
    vm.moment = moment;
    vm.esb_response = {};
    vm.tags = []; // All tags
    vm.payee_tags = []; // Submission tags
    vm.buttonStatusDisable = false;
    vm.buttonESBDisable = false;
    vm.buttonRatesDisable = false;
    vm.buttonPayeeCodesDisable = false;
    vm.buttonGenerateDocsDisable = false;
    vm.buttonEmailDocsDisable = false;
    vm.ratesUpdateCounter = 0;
    vm.checkESB = callESB;
    vm.statusESB = '';
    vm.updateStatus = openStatusModal;
    vm.updateRates = updateRates;
    vm.updatePayeeCodes = updatePayeeCodes;
    vm.generatePayeeCodes = generatePayeeCodes;
    vm.generateDocuments = generateDocuments;
    vm.emailDocumentsToPayee = emailDocumentsToPayee;
    vm.access_token = null;
    vm.isApproved = false;
    //File Upload
    vm.uploadFile = uploadFile;
    vm.picFile1 = {
            result:"",
            progress:0
        }
    // TO HIDE VIEW BASED ON USER ROLE
    // INITIAL STATE = TRUE 
    vm.role = {
      approver:true,
      sfu:true,
      viewer:true,
      reviewer:true,
      operations:true,
      admin:true
    }
    vm.roleId = "";

    // CLONE SERVICES DETAILS FOR REFERENCES
    vm.clonedSelectedServices = [];

    function init(){
      vm.access_token = $rootScope.currentUser.tokenId;
      if( !vm.submission_id){
        $state.go('index.submissions');
      }
      getDetails();
      getRole();
    }

    function getRole(){
      console.log("PAYEEID")
      console.log($rootScope.currentUser)
      Admin.getUserRole(
        {
          'id':$rootScope.currentUser.id,
          }
      )
      .$promise
      .then(function(result){
        // HIDE 
        if(result.role == "approver")
          vm.role.approver = false;
        else if(result.role == "reviewer")
          vm.role.reviewer = false;
        else if(result.role == "operations")
          vm.role.operations = false;
        else if(result.role == "sfu")
          vm.role.sfu = false;
        else if(result.role == "viewer")
          vm.role.viewer = false;
        else if(result.role == "admin")
          vm.role.admin = false;

        $rootScope.currentUser.role = result.role;
         vm.roleId = result.role_id;
         getTags();
        console.log(result);
      }, function(error){
        console.log(error);
      });
    }

    function getTags(){
      console.log("ROLE ID")
      console.log(vm.roleId)
      RoleTag.getTags({
          'id':vm.roleId,
          })
      .$promise
      .then(function(result){
        //audit log
         var logData = {'roleId': vm.roleId };
            var reqData = {
                "user_id":$rootScope.currentUser.id,
                "activity": "getTags",
                "request_info": JSON.stringify(logData),
                "role": $rootScope.currentUser.role
              };
            AuditService.postLog(reqData).then(function(data){
                  console.log(data)
              }).catch(function(error){
                console.log(error)
              })
        var statuses = [];
        if(result.length>0 && result[0]!= "no tags found"){
            result.map(function(item){
              statuses.push(item.tag)
            });
            vm.tags = statuses;
            
            console.log(vm.tags)
        }
      getSubmissionTags();
       console.log("role result")
        console.log(result);
      }, function(error){
        console.log(error);
      });
    }

    function getDetails(){
      PayeeSubmission
      .findById(
        {
          'id': vm.submission_id, 
          filter:{ 
            "include": {
              "relation": "payee", 
              "scope": {
                "include": [
                  "reporting_pdps", 
                  "services", 
                  "account_detail", 
                  "service_dpe", 
                  "service_m2u", 
                  "submissions", 
                  {
                    "relation": "details",
                    "scope": {
                      "include": ["business_type"]
                    }
                  },
                  {
                    "relation": "services_details",
                    "scope": {
                      "include": ["service"]
                    }
                  }
                ]}
              }
          }
        }
      )
      .$promise
      .then(function(result){

        // show DPE primary_input_sample_file
      /*  if(result.payee.service_dpe.primary_input_sample_file){
           vm.primary_input_sample_file = window.API_URL + "/storages/uploads/container/download/" + result.payee.service_dpe.primary_input_sample_file + "?access_token=" + vm.access_token;
        }*/
        
        
      
        console.log( "====================================" );
        

        //audit log
        var logData = {
          'id': vm.submission_id, 
          filter:{ 
            "include": {
              "relation": "payee", 
              "scope": {
                "include": [
                  "reporting_pdps", 
                  "services", 
                  "account_detail", 
                  "service_dpe", 
                  "service_m2u", 
                  "submissions", 
                  {
                    "relation": "details",
                    "scope": {
                      "include": ["business_type"]
                    }
                  },
                  {
                    "relation": "services_details",
                    "scope": {
                      "include": ["service"]
                    }
                  }
                ]}
              }
          }
        };
            var reqData = {
                "user_id":$rootScope.currentUser.id,
                "activity": "getDeatails",
                "request_info": JSON.stringify(logData),
                "role": $rootScope.currentUser.role
              };
            AuditService.postLog(reqData).then(function(data){
                  console.log(data)
              }).catch(function(error){
                console.log(error)
              })

        vm.data = result;
        if(vm.data.payee.service_m2u){
                vm.data.payee.service_m2u.primary_input_sample_file_hr = "";
            if(vm.data.payee.service_m2u.primary_input_sample_file){
                vm.data.payee.service_m2u.primary_input_sample_file_hr =  window.API_URL + "/storages/container/download/" +vm.data.payee.service_m2u.primary_input_sample_file + "?access_token=" + vm.access_token;
            }

            vm.data.payee.service_m2u.primary_input_check_digit_sample_file_hr = "";
            if(vm.data.payee.service_m2u.primary_input_check_digit_sample_file){
                vm.data.payee.service_m2u.primary_input_check_digit_sample_file_hr =  window.API_URL + "/storages/container/download/" +vm.data.payee.service_m2u.primary_input_check_digit_sample_file + "?access_token=" + vm.access_token;
            }
        }
        
        
        
        
        console.log("PROD PAYEE CODE")
        /*console.log(vm.data.payee.service_dpe.payee_code_prod)*/

        if(vm.data.payee.service_dpe){
            if(vm.data.payee.service_dpe.payee_code_prod != '' && vm.data.payee.service_dpe.payee_code_prod != undefined){
            vm.buttonPayeeCodesDisable = true;
        } 
        }
        

        // clone selected services
        vm.clonedSelectedServices = angular.copy(vm.data.payee.services_details);

        setESBDetailsFromDatabase()
      }, function(error){
        console.log(error);
      });
    }

    function callESB(account_num){
      console.log(account_num);
      vm.statusESB = "Calling ESB...";
      vm.buttonESBDisable = true;
      
      PayeeSubmission
      .callESB(
        {
          'id':vm.submission_id,
        },
        {
          'account': account_num
        }
      )
      .$promise
      .then(function(result){
        //audit log
         var logData = {
          'id':vm.submission_id,        
          'account': account_num
        };
            var reqData = {
                "user_id":$rootScope.currentUser.id,
                "activity": "callESB",
                "request_info": JSON.stringify(logData),
                "role": $rootScope.currentUser.role
              };
            AuditService.postLog(reqData).then(function(data){
                  console.log(data)
              }).catch(function(error){
                console.log(error)
              })
        console.log(result);
        vm.buttonESBDisable = false;
        vm.esb_response = result;
        vm.statusESB = "";
        console.log(result);

        if(result.error){
          notify({ message: result.error, classes: 'alert-danger', templateUrl: 'app/components/common/notify.html', duration: 0});
        }

        updateViewDataESBAccount();
        updateESBStatusView();
      }, function(error){
        console.log(error);
      });
    }

    // Update account status.
    // Will use this to Reset submission tags & enable Status Button for Approval
    function updateViewDataESBAccount(){
      console.log("vm.esb_response.company.AcctId = " + vm.esb_response.company.AcctId);
      if(vm.esb_response.company.AcctId){
        vm.data.esb_AcctId = vm.esb_response.company.AcctId;
      }
      // Reset submission tags
      getTags();
    }

    function setESBDetailsFromDatabase(){
      var data = vm.data;
      var esb_response = {};
      esb_response.company = {};
      if(data.esb_AcctId){
        esb_response.company.AcctId = data.esb_AcctId;
      }
      if(data.esb_CustId){
        esb_response.company.CustId = data.esb_CustId;
      }
      if(data.esb_AcctStatus){
        esb_response.company.AcctStatus = data.esb_AcctStatus;
      }
      if(data.esb_BRN){
        esb_response.company.BRN = data.esb_BRN;
      }
      if(data.esb_CustName){
        esb_response.company.CustName = data.esb_CustName;
      }
      if(data.esb_OCISSStatus){
        esb_response.company.OCISSStatus = data.esb_OCISSStatus;
      }
      vm.esb_response = esb_response;
      updateESBStatusView();
    }

    function updateESBStatusView(){
      if(vm.esb_response.company.AcctStatus != "" || vm.esb_response.company.AcctStatus != undefined){
          var temp = ESB_ACCOUNT_STATUS[ vm.esb_response.company.AcctStatus ];
          console.log( "updateESBStatusView temp = " + temp);
          if(temp){
            vm.esb_response.company.AcctStatus = ESB_ACCOUNT_STATUS[ vm.esb_response.company.AcctStatus ];
          }
        }
        if(vm.esb_response.company.OCISSStatus != "" || vm.esb_response.company.OCISSStatus != undefined){
          var str = vm.esb_response.company.OCISSStatus;
          if(str){
            if(str.length>0)
          vm.esb_response.company.OCISSStatus = str.trim();
          }
          
          vm.esb_response.company.OCISSStatus = ESB_OCISS_STATUS[ vm.esb_response.company.OCISSStatus ];
        }
    }

     function openStatusModal(){
      var modalInstance = $uibModal.open({
          templateUrl: 'app/modules/submissions/modals/modal_status.html',
          controller: 'ModalStatusController',
          controllerAs: 'modalStatus',
          resolve: {
            submission: function () {
              return vm.data;
            },
            tags: function(){
              return vm.tags;
            }
          },
          backdrop  : 'static',
          keyboard  : false
      });

      modalInstance.result.then(function (params) {
        notifyStatus(params);
        getDetails();
        getTags();
      }, function (reason) {
        $log.info('Modal dismissed at: ' + new Date());
      });
    }

    function notifyStatus(params){
      notify({ message: 'Your data have been updated.', classes: 'alert-success', templateUrl: 'app/components/common/notify.html'});
    }

    function getSubmissionTags(){
      PayeeSubmission
      .submission_tags({
          'id': vm.submission_id, 
          filter: {"include":["tag"] }
      })
      .$promise
      .then(function(result){
        //audit log
         var logData = {
          'id': vm.submission_id, 
          filter: {"include":["tag"] }
        };
            var reqData = {
                "user_id":$rootScope.currentUser.id,
                "activity": "getSubmissionTags",
                "request_info": JSON.stringify(logData),
                "role": $rootScope.currentUser.role
              };
             AuditService.postLog(reqData).then(function(data){
                  console.log(data)
              }).catch(function(error){
                console.log(error)
              })
        vm.payee_tags = result;
        $log.info(vm.payee_tags);
        cleanUpTags();
      }, function(error){
        console.log(error);
      });
    }

    function cleanUpTags(){
      var tag_list = [];
      $log.info("Total Payee tags = " + vm.payee_tags.length);
      for (var i = 0; i < vm.payee_tags.length; i++) {
        $log.info("counter = " + i);
        var entry = vm.payee_tags[i];
        for (var j = 0; j < vm.tags.length; j++){
          var _tag = vm.tags[j];
          if(_tag.id == entry.tag_id){
            $log.info("found");
            vm.tags.splice(j, 1);
          }
        }
      }

      checkIfReviewDone();

      if(vm.tags.length <= 0){
        vm.buttonStatusDisable = true;
      }
    }

    function checkIfApproveOrRejectedDone(){
      // check if approvd or rejected tag in the payee_tags
      var rejected;
      var found = _.find(vm.payee_tags, function(obj){ 
        if(obj.tag_id == 3 || obj.tag_id == 8){
            if(obj.tag_id == 8)
              rejected = true;
          return true;
        }
      });

      // removed other tags
      // application haven't approved or rejected
      if(!found){
        // filter others
        var filtered = _.filter(vm.tags, function(obj){ 
          if(obj.id == 3 || obj.id == 8){
            return true;
          }
        });
        vm.tags = filtered;
        // disable button if ESB Account Number or Status is empty
        if(!vm.data.esb_AcctId){
          vm.buttonStatusDisable = true;
        }else{
          vm.buttonStatusDisable = false;
        }
      }
      else{
        console.log("rejected") 
        console.log(rejected)
        if(!rejected)
          checkOpsStatus();
        else
         checkReapply();
      }
    }

    function checkReapply(){
      var found = _.find(vm.payee_tags, function(obj){ 
        if(obj.tag_id == 10){
          
          return true;
        }
      });

      // removed other tags
      if(!found){
        // filter others
        var filtered = _.filter(vm.tags, function(obj){ 
          if(obj.id == 10){
            return true;
          }
        });
        vm.tags = filtered;
      }
      else{
         vm.tags.length = 0;
      }
    }

    function checkIfReviewDone(){
      // check if reviewed tag in the payee_tags
      var found = _.find(vm.payee_tags, function(obj){ 
        if(obj.tag_id == 2){
          return true;
        }
      });

      // removed other tags
      if(!found){
        // filter others
        var filtered = _.filter(vm.tags, function(obj){
          if(obj.id == 2){
            return true;
          }
        });
        vm.tags = filtered;
      }else{
        checkIfApproveOrRejectedDone();
        checkIfApprovedAndDocumentsGenerated();
      }
    }
//check operation status
    function checkOpsStatus(){
        var found = _.find(vm.payee_tags, function(obj){ 
        if(obj.tag_id == 4){
          return true;
        }
      });

      // removed other tags
      if(!found){
        // filter others
        var filtered = _.filter(vm.tags, function(obj){ 
          if(obj.id == 4){
            return true;
          }
        });
        vm.tags = filtered;
      }
      else{
                var found5 = _.find(vm.payee_tags, function(obj){ 
                if(obj.tag_id == 5){
                  return true;
                }
              });

              // removed other tags
              if(!found5){
                // filter others
                  var filtered = _.filter(vm.tags, function(obj){ 
                    if(obj.id == 5){
                      return true;
                    }
                  });
                  vm.tags = filtered;
              }
              else{
                         var found5 = _.find(vm.payee_tags, function(obj){ 
                          if(obj.tag_id == 6){
                            return true;
                            }
                          });

                            // removed other tags
                            if(!found5){
                            // filter others
                            var filtered = _.filter(vm.tags, function(obj){ 
                              if(obj.id == 6){
                              return true;
                            }
                            });
                          vm.tags = filtered;
                          }
                      else{
                        var found = _.find(vm.payee_tags, function(obj){ 
                          if(obj.tag_id == 7){
                            return true;
                            }
                          });

                            // removed other tags
                            if(!found){
                            // filter others
                            var filtered = _.filter(vm.tags, function(obj){ 
                              if(obj.id == 7){
                              return true;
                            }
                            });
                          vm.tags = filtered;
                          }
                          else{
                            vm.tags.length = 0;
                          }
              }
      }
    }
}
    // Check if application is approved and documents have been generated
    function checkIfApprovedAndDocumentsGenerated(){
      // check if approvd or rejected tag in the payee_tags
      var found = _.find(vm.payee_tags, function(obj){ 
        if(obj.tag_id == 3){
          return true;
        }
      });

      if(found){
        vm.isApproved = true;
        // check if documents generated
      }
    }

    function updateRates(){
      vm.buttonRatesDisable = true;
      var services = vm.data.payee.services_details;
      var updated_services = [];
      var item;
      var cloned_data = {};
      vm.ratesUpdateCounter = 0;

      // check if there's differences
      // var diff = _.difference(vm.clonedSelectedServices, services);

      // console.log( vm.clonedSelectedServices );
      // console.log( services );
      // console.log(diff);

      // clean up the data
      for (var i = 0; i < services.length; i++) {
        item = services[i];
        cloned_data = {
          payee_id: item.payee_id,
          service_id: item.service_id,
          assigned_rate: item.assigned_rate,
          id: item.id
        };
        updated_services.push(cloned_data);
      }

      console.log(updated_services);
      console.log("vm.data.payee.services_details ===============");
      console.log(vm.data.payee.services_details);

      PayeeService
      .postUpdateRates({payee_id: vm.data.payee.id}, updated_services)
      .$promise
      .then(function(response) {
          $log.log(response);

          // Set audit log
          //audit log
          var logData = updated_services;
          var reqData = {
            "user_id": $rootScope.currentUser.id,
            "activity": "updateRate",
            "request_info": JSON.stringify(logData),
            "role": $rootScope.currentUser.role
          };
          AuditService.postLog(reqData).then(function(data){
                  console.log(data)
              }).catch(function(error){
                console.log(error)
              })

          vm.buttonRatesDisable = false;
          notify({ message: 'Your data have been updated.', classes: 'alert-success', templateUrl: 'app/components/common/notify.html'});
          
          return response;
        }, function(error){
          $log.log(error);
          vm.buttonRatesDisable = false;
          return error;
        });


      /*
      for (var i = 0; i < services.length; i++) {
        var item = services[i];
        PayeeService
        .prototype$updateAttributes({id: item.id}, {assigned_rate: item.assigned_rate})
        .$promise
        .then(function(result){
          //audit log
         var logData = {
          id: item.id, 
          assigned_rate: item.assigned_rate
        };
            var reqData = {
                "user_id":$rootScope.currentUser.id,
                "activity": "updateRate",
                "request_info": logData,
                "role": $rootScope.currentUser.role
              };
            AuditLog.create(reqData).$promise.then(function(result,status,headers,config){
              console.log("AuditLog")
              console.log(result);
             
            }, function(error){
              console.log(error);
            });
            console.log(result);
            vm.ratesUpdateCounter++;
            if(vm.ratesUpdateCounter >= vm.data.payee.services_details.length){
              vm.ratesUpdateCounter = 0;
              notify({ message: 'Your data have been updated.', classes: 'alert-success', templateUrl: 'app/components/common/notify.html'});
              vm.buttonRatesDisable = false;
            }
          }, function(error){
            console.log(error);
          });
      }
      */
    }

    function updatePayeeCodes(){
      vm.buttonPayeeCodesDisable = true;
      var item = vm.data.payee.service_dpe;
      PayeeServiceDPE
      .prototype$updateAttributes({id: item.id}, {payee_code_uat: item.payee_code_uat, payee_code_prod: item.payee_code_prod})
      .$promise
      .then(function(result){
          console.log(result);
          //audit log
           var logData = {
                id: item.id,
                payee_code_uat: item.payee_code_uat, 
                payee_code_prod: item.payee_code_prod
              };
            var reqData = {
                "user_id":$rootScope.currentUser.id,
                "activity": "updatePayeecode",
                "request_info": JSON.stringify(logData),
                "role": $rootScope.currentUser.role
              };
             AuditService.postLog(reqData).then(function(data){
                  console.log(data)
              }).catch(function(error){
                console.log(error)
              })
          vm.buttonPayeeCodesDisable = true;
          notify({ message: 'Your data have been updated.', classes: 'alert-success', templateUrl: 'app/components/common/notify.html'});
        }, function(error){
          console.log(error);
          vm.buttonPayeeCodesDisable = false;
        });
    }

    function generatePayeeCodes(){
      vm.buttonPayeeCodesDisable = true;
      var item = vm.data.payee.service_dpe;
      PayeeServiceDPE
      .generatePayeeCode({id: item.id})
      .$promise
      .then(function(result){
          console.log(result);
          //audit log
           var logData = {id: item.id};
            var reqData = {
                "user_id":$rootScope.currentUser.id,
                "activity": "generatePayeeCodes",
                "request_info": JSON.stringify(logData),
                "role": $rootScope.currentUser.role
              };
             AuditService.postLog(reqData).then(function(data){
                  console.log(data)
              }).catch(function(error){
                console.log(error)
              })
          vm.data.payee.service_dpe = result;
          vm.buttonPayeeCodesDisable = false;
          notify({ message: 'Your data have been updated.', classes: 'alert-success', templateUrl: 'app/components/common/notify.html'});
        }, function(error){
          console.log(error);
          vm.buttonPayeeCodesDisable = false;
        });
    }

    function generateDocuments(){
      vm.buttonGenerateDocsDisable = true;
      PayeeSubmission
      .generateDocuments({id: vm.submission_id})
      .$promise
      .then(function(result){
        vm.buttonGenerateDocsDisable = false;
        vm.data.doc_letter_offer = result.doc_letter_offer;
        vm.data.doc_service_agreement = result.doc_service_agreement;
        notify({ message: 'Payee\'s documents have been generated.', classes: 'alert-success', templateUrl: 'app/components/common/notify.html', duration: 0});
        //audit log
           var logData = {id: vm.submission_id};
            var reqData = {
                "user_id":$rootScope.currentUser.id,
                "activity": "generateDocuments",
                "request_info": JSON.stringify(logData),
                "role": $rootScope.currentUser.role
              };
             AuditService.postLog(reqData).then(function(data){
                  console.log(data)
              }).catch(function(error){
                console.log(error)
              })
      }, function(error){
        vm.buttonGenerateDocsDisable = false;
        console.log(error);
        notify({ message: "There's error generating the documents.", classes: 'alert-danger', templateUrl: 'app/components/common/notify.html'});
      });
    }

    function emailDocumentsToPayee(){
      vm.buttonEmailDocsDisable = true;
      PayeeSubmission
      .sendApprovedEmailAndDocuments({id: vm.submission_id})
      .$promise
      .then(function(result){
        vm.buttonEmailDocsDisable = false;
        notify({ message: "Payee's approval email have been submitted.", classes: 'alert-success', templateUrl: 'app/components/common/notify.html'});
         //audit log
           var logData = {id: vm.submission_id};
            var reqData = {
                "user_id":$rootScope.currentUser.id,
                "activity": "emailDocumentsToPayee",
                "request_info": JSON.stringify(logData),
                "role": $rootScope.currentUser.role
              };
             AuditService.postLog(reqData).then(function(data){
                  console.log(data)
              }).catch(function(error){
                console.log(error)
              })
      }, function(error){
        vm.buttonEmailDocsDisable = false;
        console.log(error);
        notify({ message: "There's error sending approval email.", classes: 'alert-danger', templateUrl: 'app/components/common/notify.html'});
      });
    }

    vm.clear = function(){
       vm.picFile1.result="";
      vm.picFile1.progress=0;
    }

    function uploadFile(file) {
                console.log(file)
     vm.picFile1.result="";
     vm.picFile1.progress="";
      upload({
      url: API_URL+'/storages/uploads-admin/upload',
      method: 'POST',
      data: {
        // Only works in newer browsers
        admin_id:$rootScope.currentUser.id,
        file:file,
        subId:vm.submission_id
         // a jqLite type="file" element, upload() will extract all the files from the input and put them into the FormData object before sending.
      }
    }).then(
      function (response) {
        getUploadedFiles();
        console.log(response.data); // will output whatever you choose to return from the server on a successful upload
      vm.picFile1.result="upload successful";
      vm.picFile1.progress=100;
          //audit log
          var logData = {
              url: API_URL+'/storages/documents/upload',
              method: 'POST',
              data: {
                // Only works in newer browsers
                admin_id:$rootScope.currentUser.id,
                file:file,
                subId:vm.submission_id
                 // a jqLite type="file" element, upload() will extract all the files from the input and put them into the FormData object before sending.
              }
          };
            var reqData = {
                "user_id":$rootScope.currentUser.id,
                "activity": "uploadFile",
                "request_info": JSON.stringify(logData),
                "role": $rootScope.currentUser.role
              };
             AuditService.postLog(reqData).then(function(data){
                  console.log(data)
              }).catch(function(error){
                console.log(error)
              })
      },
      function (response) {
          console.log(response); //  Will return if status code is above 200 and lower than 300, same as $http
        vm.picFile1.result="Upload failed"
      }
    );
        }

    vm.openProdStatusModal = function(){
      var modalInstance = $uibModal.open({
          templateUrl: 'app/modules/dashboard/modals/modal_prod_status.html',
          controller: 'ModalStatusController',
          controllerAs: 'modalStatus',
          resolve: {
            submission: function () {
              return vm.data;
            },
            tags: function(){
              return vm.tags;
            }
          },
          backdrop  : 'static',
          keyboard  : false
      });

      modalInstance.result.then(function (params) {
        console.log("PARAMS")
        console.log(params)
      }, function (reason) {
        console.log(reason)
        if(reason.status == 'ok'){
          vm.updatePayeeCodes();
        }
        $log.info('Modal dismissed at: ' + new Date());
      });
    }
     function getUploadedFiles(){
      if($rootScope.currentUser.id != undefined)
      var user_id = $rootScope.currentUser.id;
      SubmissionFile
      .find({filter:{"where":{"admin_id": parseInt(user_id),"submission_id":vm.submission_id}}})
      .$promise
      .then(function(result){
       console.log(result)
       if(result.length > 0){
          vm.user_records = result.filter(function(item){
           return parseInt(item.admin_id) == parseInt($rootScope.currentUser.id)
        });
    
          vm.user_records.map(function(item){
              item.file_link_path = window.API_URL + "/storages/uploads-admin/download/" + item.file_path + "?access_token=" + vm.access_token;
          });
          vm.user_records = vm.user_records.slice().reverse();
          console.log("IMAGES")
          console.log(vm.user_records)
       }
        
       
      }, function(error){
        console.log(error);
        
      });
    }
    init();
  }

})();
