/**
 * Created by nferon on 17/06/16.
 */
'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:GlobalCtrl
 * @description
 * # GlobalCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
    .controller('GlobalCtrl', function ($scope, $resource, config, $uibModal, $rootScope, $q) {

        $scope.globalGraphSigma = [];
        $scope.layoutChoice = "GEM%20(Frick)";
        $scope.globalel = false;
        $rootScope.suggestions = [];

        // get layout algo
        var Layout = $resource(config.apiUrl + 'layoutAlgorithm');
        var layout = Layout.query();
        layout.$promise.then(function (result) {
            var layout = []
            var layoutName = ""
            angular.forEach(result, function(value, key) {
                layoutName = ""
                angular.forEach(value, function(value2, key) {
                    layoutName += value2;
                });
                layout.push(layoutName)
            });
            $scope.layout = layout;
        });


        $scope.submit = function () {
            // // Read the complete graph from api
            var drawGraph = $resource(config.apiUrl + 'draw/complete/' + $scope.layoutChoice);
            var drawgraph = drawGraph.query();
            drawgraph.$promise.then(function (result) {
                $scope.globalGraphSigma = result.pop();
                angular.forEach($scope.globalGraphSigma.nodes, function(node) {
                    if(node.name != undefined)
                        $rootScope.suggestions.push(node.name);
                    else if(node.title != undefined)
                        $rootScope.suggestions.push(node.title);
                    else if(node.subject != undefined)
                        $rootScope.suggestions.push(node.subject);
                });
            });
        };
        $scope.submit();

        /*** TimeLine ****/
        $scope.time_data = [];
        $scope.selected = {};
        var timeLinePromises = [];

        // Create promises array to wait all data until load
        timeLinePromises.push($resource(config.apiUrl + 'users/count/timestamp').query().$promise);
        timeLinePromises.push($resource(config.apiUrl + 'posts/count/timestamp').query().$promise);
        timeLinePromises.push($resource(config.apiUrl + 'comments/count/timestamp').query().$promise);

        $q.all(timeLinePromises).then(function(results) {
            var tmp = {"users": [], "posts": [], "comments": []};
            // Users
            angular.forEach(results[0], function(result) {
                tmp.users.push(result);
            });
            // Posts
            angular.forEach(results[1], function(result) {
                tmp.posts.push(result);
            });
            // Comments
            angular.forEach(results[2], function (result) {
                tmp.comments.push(result);
            });
            // append data
            $scope.time_data = tmp;
        }, function (reject) {
            console.log(reject);
        });

        // Time selevction have been made on the chart
        $scope.extent = function (start, end) {
            if(!start && !end) //release signal
                refreshPostType(); 
            else {
                $scope.selected.start = start;
                $scope.selected.end = end;
                // Update sigma filter
                $scope.filter = {"start": start.getTime(), "end": end.getTime()};
                $scope.$apply();
            }
        };

        /*** Radar Chart ***/
        var all = {name: "all"};
        var postSelection = [all];

        // Call api and load postType
        var refreshPostType = function () {
            $scope.postType = {};
            $scope.postType.series = [];
            $scope.postType.labels = [];

            var params = {"uid": []};

            angular.forEach(postSelection, function(selection) {
                if(selection != all) {
                    params.uid.push(selection.id);
                    $scope.postType.series.push(selection.name);
                }
            });

            if($scope.selected.start != undefined)
                params.start = $scope.selected.start.getTime();
            if($scope.selected.end != undefined)
                params.end = $scope.selected.end.getTime();

            var Type = $resource(config.apiUrl + 'post/getType/', params);
            var type = Type.query();
            type.$promise.then(function (result) {
                $scope.postType.labels = result[0].labels;
                if(postSelection.indexOf(all) != -1) {
                    $scope.postType.data = result[0].data;
                    $scope.postType.series.push("all");
                }
                else {
                    result[0].data.shift();
                    $scope.postType.data = result[0].data;
                }
            });
        };

        //default load all post type
        refreshPostType();

        var postTypeAddUser = function (uid, name, append) {
            if(append)
                postSelection.push({id: uid, name: name});
            else
                postSelection = [{id: uid, name: name}];
            refreshPostType();
        };

        /*** Event Catcher ***/
        $scope.eventCatcher = function (e) {
            switch(e.type) {
                case 'clickNode':
                    if(e.data.node.uid != undefined) {
                        postTypeAddUser(e.data.node.uid, e.data.node.name, e.data.captor.altKey);
                    }
                    else {
                        // if(e.data.node.uid != undefined) {
                        //     $scope.elementType = "uid";
                        //     $scope.elementId = e.data.node.uid;
                        // }
                        //else
                        if (e.data.node.pid != undefined) {
                            $scope.elementType = "pid";
                            $scope.elementId = e.data.node.pid;
                        }
                        else if (e.data.node.cid != undefined) {
                            $scope.elementType = "cid";
                            $scope.elementId = e.data.node.cid;
                        }
                        $scope.openModal($scope.elementType, $scope.elementId);
                    }
                    break;
            }
        };

        /********* Modal  ***************/
        $scope.openModal = function (type, id) {
            $scope.elementType = type;
            $scope.elementId = id;

            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'views/ui-elements/modal-view.html',
                controller: 'ModalInstanceCtrl',
                buttons: {
                    Cancel: function () {
                        $("#modal_dialog").dialog("close");
                    }
                },
                resolve: {
                    scopeParent: function() {
                        return $scope; //On passe à la fenêtre modal une référence vers le scope parent.
                    }
                }
            });

            // Catch return, reopen a new modal ?
            modalInstance.result.then(function (res) {
                if(res != undefined) {
                    res = res.split(':');
                    $scope.openModal(res[0], res[1]);
                }
            });
        };

        /*** search catcher *****/
        $scope.locate = [];
        $rootScope.$watch('search', function(newVal) {
            var locateTmp = [];
            angular.forEach($scope.globalGraphSigma.nodes, function(node) {
                if( node.name == newVal || node.title == newVal || node.subject == newVal) {
                    if( node.uid != undefined) {
                        locateTmp.push(node.uid);
                        postTypeAddUser(node.uid, node.name, false);
                    }
                    else if( node.pid != undefined) {
                        locateTmp.push(node.pid);
                    }
                    else if( node.cid != undefined) {
                        locateTmp.push(node.cid);
                    }
                }
            });
            $scope.locate = locateTmp;
        });
    });
