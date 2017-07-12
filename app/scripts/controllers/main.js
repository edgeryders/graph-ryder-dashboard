'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('MainCtrl', function($scope, $resource, config, $rootScope, $q) {

    $rootScope.ready = false;

    /***** Load layout algorithm *******/
    var Layout = $resource(config.apiUrl + 'layoutAlgorithm');
    var layout = Layout.query();
    layout.$promise.then(function (result) {
      var layout = [];
      var layoutName = "";
      angular.forEach(result, function (value) {
        layoutName = "";
        angular.forEach(value, function (value2) {
          layoutName += value2;
        });
        layout.push(layoutName)
      });
      $rootScope.layout = layout;
      $rootScope.ready = true;
    });

    $rootScope.getDate = function (timestamp) {
            function complete(val) {
                if (val < 10)
                    return "0"+val;
                else
                    return val;
            };
            var date = new Date(timestamp);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ' ' + complete(date.getHours()) + ':' + complete(date.getMinutes());
        };

    /***** Load all data *****/
    $rootScope.suggestions = [];
    $rootScope.suggestionsUser_temp = [];
    $rootScope.suggestionsTag_temp = [];

    $rootScope.resetSuggestions = function (users, posts, comments, tags) {
        var collectPromises = [];
        // Create promises array to wait all data until load
        collectPromises.push($resource(config.apiUrl + 'users').query().$promise);
        collectPromises.push($resource(config.apiUrl + 'posts').query().$promise);
        collectPromises.push($resource(config.apiUrl + 'comments').query().$promise);
        collectPromises.push($resource(config.apiUrl + 'tags').query().$promise);

        $q.all(collectPromises).then(function (results) {
            if(users) {
                angular.forEach(results[0], function (user) {
                    user.label = user.label;
                    $rootScope.suggestions.push(user);
                    $rootScope.suggestionsUser_temp.push(user);
                });
                $rootScope.suggestionsUser = $rootScope.suggestionsUser_temp;
            }
            if(posts) {
                angular.forEach(results[1], function (post) {
                    post.label = post.title;
                    $rootScope.suggestions.push(post);
                });
            }
            if(comments) {
                angular.forEach(results[2], function (comment) {
                    comment.label = comment.title;
                    $rootScope.suggestions.push(comment);
                });
            }
            if(tags) {
                angular.forEach(results[3], function (tag) {
                    $rootScope.suggestions.push(tag);
                    $rootScope.suggestionsTag_temp.push(tag);
                });
                $rootScope.suggestionsTag = $rootScope.suggestionsTag_temp;
            }
        }, function (reject) {
            console.log(reject);
        });
    };

    $rootScope.resetSuggestions(true, true, true, true);
  });
