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
    .controller('GlobalCtrl', function ($scope, $resource, config, $uibModal, $rootScope, $timeout) {

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
        var tmp = {"users": [], "posts": []};
        var usersTime = $resource(config.apiUrl + 'users/count/timestamp');
        var userTimePromise = usersTime.query();
        userTimePromise.$promise.then(function (results) {
            angular.forEach(results, function(result) {
                tmp.users.push(result);
            });
        });

        var postsTime = $resource(config.apiUrl + 'posts/count/timestamp');
        var postsTimePromise = postsTime.query();
        postsTimePromise.$promise.then(function (results) {
            angular.forEach(results, function(result) {
                tmp.posts.push(result);
            });
            $scope.time_data = tmp;
        });

        /*** Radar Chart ***/
        $scope.post = {};
        // get posts type
        var Type = $resource(config.apiUrl + 'post/getType/');
        var type = Type.query();
        type.$promise.then(function (result) {
            $scope.post.labels = result[0].labels;
            $scope.post.data = result[0].data;
            $scope.post.series = ["all"]
        });

        var postTypeAddUser = function (uid, name, append) {
            var params = {"uid": uid};
            var Type = $resource(config.apiUrl + 'post/getType/', params);
            var type = Type.query();
            type.$promise.then(function (result) {
                if(result[0].data[1] != undefined)
                    if(append) {
                        $scope.post.data.push(result[0].data[1]);
                        $scope.post.series.push(name);
                    }
                    else {
                        $scope.post.data = [result[0].data[1]];
                        $scope.post.series = [name];
                    }
            });
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
