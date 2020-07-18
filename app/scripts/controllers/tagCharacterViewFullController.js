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
    .controller('TagCharacterViewFullCtrl', function ($scope, $resource, config, $uibModal, $rootScope, $q, $location, $timeout, $compile) {

        /**** Init ****/
        //edge label default
        $scope.tagnl = false;
        $scope.nodelabelthreshold = 10;
        $scope.clean_refresh_sigma_decorator = 0;
        $scope.requestFullTagGraph = false;
        $scope.filter_occurrence_min = "2";
        $scope.filter_occurrence_max = "100";
        $scope.filter_occurrence_request = "3";
        $scope.interactor = "navigate";
        $scope.infoPanelParent = "infoPanelParent";
        $("#download_link_dialog").dialog({ autoOpen: false });
        // When rootScope is ready load the graph
        $rootScope.$watch('ready', function(newVal) {
            if(newVal) {
                $scope.layoutChoice = $rootScope.layout[12];
                //$scope.tableSizeChoice = 10;
                $scope.selected.start= new Date(0);
                $scope.selected.end= new Date(Date.now());
                $scope.generateGraph();
                $rootScope.resetSuggestions(false, false, false, true);
            }
        });

        $("#node-label-intensity-slider input").ionRangeSlider({
          min: 0,
          max: $scope.nodelabelthreshold-1,
          from: 0,
          hide_min_max: true,
          hide_from_to: true,
          grid: false,
          onChange: function(val) {
            $scope.nodelabelthreshold = 10-val.from;
            $scope.$apply();
          }
        });
    
        $("#cooccurrence-intensity-slider-range input").ionRangeSlider({
          type: "double",
          min: 1,
          max: $scope.filter_occurrence_max,
          from: $scope.filter_occurrence_min,
          to: $scope.filter_occurrence_max,
          hide_min_max: true,
          hide_from_to: true,
          grid: false,
          onChange: function(val) {
            $scope.filter_occurrence_min = val.from;
            $scope.filter_occurrence_max = val.to;
            $scope.$apply();
          }
        });

        $("#cooccurrence-draw-graph-spinner").spinner({
            min: 1,
            value: $scope.filter_occurrence_request
        });

        $scope.switchForceNodeLabel = function() {
            if ($scope.tagnl) {
                $scope.nodelabelthreshold = 0;
            } else {
                $scope.nodelabelthreshold = 10;
            }
        };

        /***** Global view *****/
        $scope.tagGraphSigma = [];

        $scope.drawGraph = function (result) {
            var drawGraph = $resource(config.apiUrl + 'draw/tagToTagsChar/'+ $scope.layoutChoice);
            var drawgraph = drawGraph.get();
            drawgraph.$promise.then(function (result) {
                $scope.tagGraphSigma = result;
            });
        };

        $scope.generateGraph = function () {
            //$scope.filter_occ = filter_occ;
            var createGraph = $resource(config.apiUrl + 'generateTagCharFullGraph/' + $("#cooccurrence-draw-graph-spinner").spinner("value") + "/" + $scope.selected.start.getTime() + "/" + $scope.selected.end.getTime()+"/0");
            //var createGraph = $resource(config.apiUrl + 'generateTagGraph/' + $scope.tag_id);
            var createGraphPromise = createGraph.get();
            createGraphPromise.$promise.then(function (result) {
                $scope.drawGraph();
                //console.log($scope.sigma_instance.graph.nodes())
            });
        };

        $scope.generateDownloadLink = function () {
            $("#download_link_dialog").html($rootScope.generateDownloadLinkForSigma( $scope.tagGraphSigma.nodes, $scope.tagGraphSigma.edges, 'tag_full_view'));
            $("#download_link_dialog").attr('title', 'Download a copy of the graph');
            $("#download_link_dialog").dialog("open");
        }

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
                        $scope.generateGraph($scope.tag_id);
                });
            } else {
                $scope.selected.start = start;
                $scope.selected.end = end;
                // Update sigma filter
                $scope.filter = {"start": start.getTime(), "end": end.getTime()};
            }
        };


        /*** Sigma Event Catcher ***/
        $scope.eventCatcher = function (e) {
            switch(e.type) {
                case 'clickNode':
                    if (e.data.node.tag_id != undefined && (e.data.captor.ctrlKey || $scope.interactor == "information")) {
                        $scope.elementType = "tag";
                        $scope.elementId = e.data.node.tag_id;
                        $scope.openInfoPanel($scope.elementType, $scope.elementId);
                    }
                    else if ($scope.interactor == "neighbourhood") {
                        // Delegated to directive sigma.js
                    }
                    else if ($scope.interactor == "dragNode") {
                        // Delegated to directive sigma.js
                    } else {
                        console.log("Unexpected node: "+e.data.node);
                    }
                    break;
                case 'clickEdges':
                    if(e.data.edge != undefined && e.data.edge.length > 0 && ((e.data.captor.ctrlKey || $scope.interactor == "information") || (e.data.captor.shiftKey || $scope.interactor == "focus"))) {
                        $scope.elementType = "double-tag";
                        $scope.elementId = e.data.edge[0].tag_1+"-"+e.data.edge[0].tag_2;
                        $scope.openInfoPanel($scope.elementType, $scope.elementId);
                    }
                    break;
            }
        };

        /********* Info Panel ***************/
        $scope.openInfoPanel = function(elementType, elementId) {
            var mod = document.createElement("panel-info");
            mod.setAttribute("type", elementType);
            mod.setAttribute("id", elementId);
            mod.setAttribute("parent", $scope.infoPanelParent);
            jQuery("#"+ $scope.infoPanelParent).append(mod);
            $compile(mod)($scope);
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

        /******** Interactor Manager ********/
        $scope.clearInteractor = function() {
            document.getElementById("interactorNavigate").className="btn btn-default";
            document.getElementById("interactorInformation").className="btn btn-default";
            document.getElementById("interactorNeighbourhood").className="btn btn-default";
            document.getElementById("interactorDragNode").className="btn btn-default";
        }

        $scope.setInteractorNavigate = function () {
            $scope.clearInteractor();
            $scope.interactor="navigate";
            document.getElementById("interactorNavigate").className="btn btn-primary";
        }

        $scope.setInteractorInformation = function () {
            $scope.clearInteractor();
            $scope.interactor="information";
            document.getElementById("interactorInformation").className="btn btn-primary";
        }

        $scope.setInteractorNeighbourhood = function () {
            $scope.clearInteractor();
            $scope.interactor="neighbourhood";
            document.getElementById("interactorNeighbourhood").className="btn btn-primary";
        }

        $scope.setInteractorDragNode = function () {
            $scope.clearInteractor();
            $scope.interactor="dragNode";
            document.getElementById("interactorDragNode").className="btn btn-primary";
        }

        $scope.cleanRefreshSigmaDecorator = function () {
            $scope.clean_refresh_sigma_decorator++;
        }

        /*** Search Bar Catcher *****/
        $rootScope.$watch('search', function(newVal) {
            var locateTmp = [];
            if(newVal != undefined) {
                if( newVal.user_id != undefined) {
                    $scope.openInfoPanel('user',  newVal.user_id );
                }
                else if( newVal.post_id != undefined) {
                    $scope.openInfoPanel('post',  newVal.post_id );
                }
                else if( newVal.comment_id != undefined) {
                    $scope.openInfoPanel('comment',  newVal.comment_id );
                }
                else if( newVal.tag_id != undefined) {
                    $scope.openInfoPanel('tag',  newVal.tag_id );
                }
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
