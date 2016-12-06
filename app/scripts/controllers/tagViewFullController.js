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
    .controller('TagViewFullCtrl', function ($scope, $resource, config, $uibModal, $rootScope, $q, $location, $timeout) {

        /**** Init ****/
        //edge label default
        $scope.tagel = false;
        $scope.locate = "";
        $scope.requestFullTagGraph = false;
        $scope.filterLevels = ["1","2","3","4","5","6","7","8"];
        // When rootScope is ready load the graph
        $rootScope.$watch('ready', function(newVal) {
            if(newVal) {
                $scope.layoutChoice = $rootScope.layout[12];
                $scope.filterOcc = $scope.filterLevels[1];
                //$scope.tableSizeChoice = 10;
                $scope.selected.start= new Date(0);
                $scope.selected.end= new Date(Date.now());
                $scope.drawGraph(2);
                //load tags then create the graph
                /*var Tags = $resource(config.apiUrl + "tags/"+$scope.selected.start.getTime()+"/"+$scope.selected.end.getTime()+"/10").query().$promise;
                Tags.then(function (result) {
                    $scope.tags = result;
                    if($scope.tags[0])
                       
                });*/
            }
        });

        /***** Global view *****/
        $scope.tagGraphSigma = [];

        $scope.drawGraph = function () {
            //$scope.filter_occ = filter_occ;
            var createGraph = $resource(config.apiUrl + 'generateTagFullGraph/' + $scope.filterOcc + "/" + $scope.selected.start.getTime() + "/" + $scope.selected.end.getTime());
            //var createGraph = $resource(config.apiUrl + 'generateTagGraph/' + $scope.tag_id);
            var createGraphPromise = createGraph.get();
            createGraphPromise.$promise.then(function (result) {
                var drawGraph = $resource(config.apiUrl + 'draw/tagToTags/'+ $scope.layoutChoice);
                var drawgraph = drawGraph.get();
                drawgraph.$promise.then(function (result) {
                    $scope.tagGraphSigma = result;
                });
            });
        };

/*
    Generate full tag-to-tag network once when loading then compute the filtering during the drawGraph function*/

        /*** TimeLine ****/
        $scope.time_data = [];
        $scope.selected = {};
        var timeLinePromises = [];

        // Create promises array to wait all data until load
        //timeLinePromises.push($resource(config.apiUrl + 'posts/count/timestamp').query().$promise);
        //timeLinePromises.push($resource(config.apiUrl + 'comments/count/timestamp').query().$promise);

        $q.all(timeLinePromises).then(function(results) {
            var tmp = {"users": [], "posts": [], "comments": []};
            // Posts
            angular.forEach(results[0], function(result) {
                tmp.posts.push(result);
            });
            // Comments
            angular.forEach(results[1], function (result) {
                tmp.comments.push(result);
            });
            // append data
            $scope.time_data = tmp;
        }, function (reject) {
            console.log(reject);
        });

        $scope.resetTimeLine = function () {
            $scope.selected.start= new Date(0);
            $scope.selected.end= new Date(Date.now());
            $scope.extent($scope.extent.start,  $scope.extent.end);
        }

        // Time selection have been made on the chart
        $scope.extent = function (start, end) {
            if(!start && !end) { //release signal
                var Tags = $resource(config.apiUrl + "tags/"+$scope.selected.start.getTime()+"/"+$scope.selected.end.getTime()+"/"+$scope.tableSizeChoice).query().$promise;
                Tags.then(function (result) {
                    $scope.tags = result;
                    if($scope.tags[0])
                        $scope.drawGraph($scope.tag_id);
                });
                $scope.$apply();
            } else {
                $scope.selected.start = start;
                $scope.selected.end = end;
                // Update sigma filter
                $scope.filter = {"start": start.getTime(), "end": end.getTime()};
                $scope.$apply();
            }
        };


        /*** Sigma Event Catcher ***/
        $scope.eventCatcher = function (e) {
            switch(e.type) {
                case 'clickNode':
                    if(e.data.node.tag_id != undefined && e.data.captor.shiftKey) {
                        $scope.drawGraph(e.data.node.tag_id);
                    }
                    else {
                        if(e.data.node.user_id != undefined) {
                            $scope.elementType = "user";
                            $scope.elementId = e.data.node.user_id
                        }
                        else if (e.data.node.post_id != undefined) {
                            $scope.elementType = "post";
                            $scope.elementId = e.data.node.post_id;
                        }
                        else if (e.data.node.comment_id != undefined) {
                            $scope.elementType = "comment";
                            $scope.elementId = e.data.node.comment_id;
                        }
                        else if (e.data.node.tag_id != undefined) {
                            $scope.elementType = "tag";
                            $scope.elementId = e.data.node.tag_id;
                        }
                        else if (e.data.node.annotation_id != undefined) {
                            $scope.elementType = "annotation";
                            $scope.elementId = e.data.node.annotation_id;
                        }
                        else {
                            console.log("Unexpected node: "+e.data.node);
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

        /*** Search Bar Catcher *****/
        $rootScope.$watch('search', function(newVal) {
            var locateTmp = [];
            if(newVal != undefined) {
                if( newVal.uid != undefined) {
                    locateTmp.push(newVal.uid);
                    postTypeAddUser(newVal.uid, newVal.name, false);
                }
                else if( newVal.pid != undefined) {
                    locateTmp.push(newVal.pid);
                }
                else if( newVal.cid != undefined) {
                    locateTmp.push(newVal.cid);
                }
                if (!$scope.drawGraphPromise.$resolved) // todo do not wait but cancel the promise
                    $timeout(function() {$scope.locate = locateTmp;}, 5000);
                else
                    $scope.locate = locateTmp;
            }
        });
        $scope.$on("$destroy", function(){
            //todo stop all active request
            // remove watchers in rootScope
            angular.forEach($rootScope.$$watchers, function(watcher, key) {
                if(watcher.exp === 'search' || watcher.exp === 'ready') {
                    $rootScope.$$watchers.splice(key, 1);
                }
            });
        });
    });
