/**
 * Created by Alfred on 2015-04-17.
 */

(function () {
  'use strict';

  function OutstandingItemsCtrl(TransactionService) {

    var vm = this;
    vm.remind = remind;
    vm.confirm = confirm;
    vm.returnItem = returnItem;
    vm.transactionStatus = {
      returned: 2,
      active: 1
    };

    init();

    function init() {
      vm.owed = [];
      vm.owe = [];

      TransactionService
        .getOutstandingItems()
        .then(function (data) {
          vm.owed = data.owed;
          vm.owe = data.owe;
        });

      TransactionService.subscribeToCreate(update);
    }

    function returnItem(recordId, transactionGuid){
      TransactionService
        .returnItem(transactionGuid)
        .then(function () {
          var i, k, record, trans, recordBreak;

          for (i = 0; record = vm.owe[i]; i++) {
            if (recordId !== record.id) continue;
            for (k = 0; trans = record.transactions[k]; k++){
              if (trans.identifier !== transactionGuid) continue;
              record.transactions.splice(k, 1);
              recordBreak = true;
              break;
            }

            if (recordBreak){
              if (record.transactions.length === 0){
                vm.owe.splice(i,1);
              }

              break;
            }
          }
        }, function (err) {
          console.log(err);
        })
    }

    /**
     * Callback that is called when a new record
     * has been added
     * @param item
     */
    function update(item) {
      var i, record;
      for (i = 0; record = vm.owed[i]; i++) {
        /** @namespace item.owerId */
        if (record.owerId === item.owerId) {
          item.transactions.forEach(function (trans) {
            record.transactions.push(trans);
          });
          return;
        }
      }

      // if not in records list, add it with the user
      record = item;
      vm.owed.push(record);
    }

    function remind(userId) {
      TransactionService.remindUser(userId).then(function (data) {

      }, function (error) {

      });
    }

    function confirm(recordId, transactionId) {
      TransactionService
        .confirm(transactionId)
        .then(function () {
          var i, k, record, trans, recordBreak;

          for (i = 0; record = vm.owed[i]; i++) {
            if (recordId !== record.id) continue;
            for (k = 0; trans = record.transactions[k]; k++){
              if (trans.id !== transactionId) continue;
              record.transactions.splice(k, 1);
              recordBreak = true;
              break;
            }

            if (recordBreak){
              if (record.transactions.length === 0){
                vm.owed.splice(i,1);
              }

              break;
            }
          }
        }, function (err) {
          console.log(err);
        });
    }

  }

  OutstandingItemsCtrl.$inject = ['TransactionService'];

  angular.module('youomi.dashboard').controller('OutstandingItemsCtrl', OutstandingItemsCtrl);

})();
