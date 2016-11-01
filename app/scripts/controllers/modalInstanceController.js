/**
 * Created by nferon on 21/06/16.
 */
angular.module('sbAdminApp')
    .controller('ModalInstanceCtrl', function ($scope, $resource, $uibModalInstance, config, scopeParent) {
        
        $scope.elementId = scopeParent.elementId;
        $scope.elementType = scopeParent.elementType;
        $scope.loading = true;

        switch($scope.elementType) {
            case "user":
                var User = $resource(config.apiUrl + "users/hydrate/" + $scope.elementId);
                var user = User.get();
                user.$promise.then(function (result) {
                    $scope.loading = false;
                    $scope.user = result;
                });
                break;
            case "post":
                var Post = $resource(config.apiUrl + "post/hydrate/" + $scope.elementId);
                var post = Post.get();
                post.$promise.then(function (result) {
                    $scope.loading = false;
                    $scope.post = result;
                });
                break;
            case "comment":
                var Comment = $resource(config.apiUrl + "comment/hydrate/" + $scope.elementId);
                var comment = Comment.get();
                comment.$promise.then(function (result) {
                    $scope.loading = false;
                    $scope.comment = result;
                });
                break;
            case "tag":
                var Tag = $resource(config.apiUrl + "tag/hydrate/" + $scope.elementId);
                var tag = Tag.get();
                tag.$promise.then(function (result) {
                    $scope.loading = false;
                    $scope.tag = result;
                });
                break;
            case "annotation":
                var Annotation = $resource(config.apiUrl + "annotations/hydrate/" + $scope.elementId);
                var annotation = Annotation.get();
                annotation.$promise.then(function (result) {
                    $scope.loading = false;
                    $scope.annotation = result;
                });
                break;
            case "all users":
                var User = $resource(config.apiUrl + "users").query().$promise;
                User.then(function (result) {
                    $scope.loading = false;
                    $scope.users = result;
                });
                break;
            case "all posts":
                var Post = $resource(config.apiUrl + "posts").query().$promise;
                Post.then(function (result) {
                    $scope.loading = false;
                    $scope.posts = result;
                });
                break;
            case "all comments":
                var Comment = $resource(config.apiUrl + "comments").query().$promise;
                Comment.then(function (result) {
                    $scope.loading = false;
                    $scope.comments = result;
                });
                break;
            case "all tags":
                var Tag = $resource(config.apiUrl + "tags").query().$promise;
                Tag.then(function (result) {
                    $scope.loading = false;
                    $scope.tags = result;
                });
                break;
            default:
                console.log("error with modalView directive unknow type");
        }
        $scope.cancel = function () {
            $uibModalInstance.close();
        };

        $scope.getDate = function (timestamp) {
            var date = new Date(timestamp);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
        };

        $scope.openModal = function (type, id) {
            $uibModalInstance.close(type + ':' +id);
        };
});
