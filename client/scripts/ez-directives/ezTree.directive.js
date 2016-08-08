(function() {
  var module = null;
  try {
        module = angular.module('ezDirectives');
    } catch (e) {
        module = angular.module('ezDirectives', []);
    }
  
  this.template = [
    '<div>{{title}} ',
        '<ul style="list-style-type:none;">',
          '<div ng-repeat="n in flatTree">',
            '<li  class="node" ng-if="!n.__isHidden"',
                'ng-class=" { \'node-selected\':n.__isSelected, \'node-unselected\': !n.__isSelected}">',
              '<div style="width:100%;">',
                '<span ng-style="{\'margin-left\': levelMargin * n.__level + \'px\'}" >',
                  '<span ng-if="!n.__isLeaf && !n.__isExpanded"  >',
                    '<span ng-if="n.__hasChildren" ng-click="toggleNodeVisibility(n,$event)" style="margine-right:2px;" class="handCursor tree-toggler tree-toggler-right glyphicon glyphicon-chevron-right "></span>',
                    '<span ng-if="!n.__hasChildren" class="handCursor tree-toggler tree-toggler-right  icon-blank icon-spacer padding-right:{{levelMargin}}px""></span>',
                    '<span ng-click="toggleSelection(n,$event)" class="handCursor mdi-file-folder mdi-action-view-module glyphicon glyphicon-folder-close"></span>',
                  '</span>',
                  '<span ng-if="!n.__isLeaf && n.__isExpanded"  >',
                    '<span  ng-if="n.__hasChildren" ng-click="toggleNodeVisibility(n,$event)" style="margine-right:2px;" class="handCursor tree-toggler tree-toggler-down glyphicon glyphicon-chevron-down"></span>',
                    '<span ng-if="!n.__hasChildren" class="handCursor tree-toggler tree-toggler-right  icon-blank icon-spacer padding-right:{{levelMargin}}px""></span>',
                    '<span ng-click="toggleSelection(n,$event)" class="handCursor mdi-file-folder-open mdi-action-view-module glyphicon glyphicon-folder-open"></span>',
                  '</span>',
                  '<span ng-if="n.__isLeaf"  >',
                    '<span ng-if="!n.__hasChildren" class="handCursor tree-toggler tree-toggler-right icon-blank icon-spacer" ng-style="{\'margin-left\': levelMargin}px"></span>',
                    '<span ng-click="toggleSelection(n,$event)" class="handCursor mdi-file mdi-action-view-module glyphicon glyphicon-file"></span>',
                  '</span>',
                '</span> ',
                //'<div style=" background-color:red;" ng-click="toggleSelection(n,$event)"> ',
                    '<span class="handCursor" ng-click="toggleSelection(n,$event)">{{n[options.nameAttrib]}}</span>',
                //'</div>',  
              '</div>',
            '</li>',
          '</div>',
        '</ul>',
      '</div>',
    ].join('\n');
    
    this.materialTemplate = [
    '<div >{{title}} ',
        '<ul style="list-style-type:none;padding: 10px;">',
          '<div ng-repeat="n in flatTree">',
            '<li  class="node" ng-if="!n.__isHidden"',
                'ng-class=" { \'node-selected\':n.__isSelected, \'node-unselected\': !n.__isSelected}">',
              '<div style="width:100%;"  layout="row" layout-align="left center ">',
                '<span ng-style=\"{\'margin-left\':levelMargin * n.__level + \'px\'}\" >',
                  
                  '<span ng-if="!n.__isLeaf && !n.__isExpanded"  >',                    
                    '<span ng-if="n.__hasChildren" ng-click="toggleNodeVisibility(n,$event)" style="margine-right:2px;" class="handCursor tree-toggler  tree-toggler-right "> <i class="material-icons">play_arrow</i></span>',
                    '<span ng-if="!n.__hasChildren" class="icon-spacer" style="padding-right:{{levelMargin}}px"></span>',
                    '<span ng-click="toggleSelection(n,$event)" class="handCursor mdi-file-folder mdi-action-view-module "><i class="material-icons">{{n.icon || "folder"}}</i> </span>',
                  '</span>',
                  '<span ng-if="!n.__isLeaf && n.__isExpanded"  >',
                    '<span  ng-if="n.__hasChildren" ng-click="toggleNodeVisibility(n,$event)" style="margine-right:2px;" class="handCursor tree-toggler tree-toggler-down "><i class="material-icons rotate-270">play_arrow</i></span>',
                    '<span ng-if="!n.__hasChildren" style="margin-right:2px; padding-right:{{levelMargin}}px" class="handCursor tree-toggler tree-toggler-right  icon-spacer"></span>',
                    '<span ng-click="toggleSelection(n,$event)" class="handCursor mdi-file-folder-open mdi-action-view-module"><i class="material-icons">{{n.icon || "folder"}}</i></span>',
                  '</span>',
                  '<span ng-if="n.__isLeaf"  >',
                    '<span class="handCursor tree-toggler tree-toggler-right icon-spacer " ng-style="{\'margin-left\': levelMargin}px"></span>',
                    '<span ng-click="toggleSelection(n,$event)" class="handCursor mdi-file mdi-action-view-module"><i class="material-icons">{{n.icon||"description"}}</i></span>',
                  '</span>',
                '</span> ',
                //'<div style=" background-color:red;" ng-click="toggleSelection(n,$event)"> ',
                    '<span class="handCursor" ng-click="toggleSelection(n,$event)">{{n[options.nameAttrib]}}</span>',
                //'</div>',  
              '</div>',
            '</li>',
          '</div>',
        '</ul>',
      '</div>',
    ].join('\n');
  module.directive('ezTree', [
    '$timeout', function($timeout) {
      return {
        restrict: 'AE',
        template: this.template,
        replace: true,
        scope: {
          tree: '=',
          onSelect: '=',
          selectedNodes: '=',
          allowMultiSelect: '=',
          options:'=',
          parentTrail:"="
        },
        //controller start
        controller: ["$scope", function ($scope) {
            $scope.title = "";
            var options = {
                idAttrib: "Id",
                nameAttrib: "Name",
                childrenAttrib: "Children"

            };
          
            var init = function(){
                if($scope.options){
                    options = {
                        idAttrib        : $scope.options.idAttrib,
                        nameAttrib      :$scope.options.nameAttrib,
                        childrenAttrib  : $scope.options.childrenAttrib
                    };

                }
                else{
                    $scope.options = options;
                }
                $scope.levelMargin=25;
                $scope.flatTree = [];
                if($scope.tree){
                    var dupNode = angular.copy($scope.tree);
                    dupNode.__level = 0;
                    dupNode.__isHidden = false;
                    dupNode.__isExpanded = false;
                    dupNode.__isSelected = true;
                    dupNode.__hasChildren = true;
                    dupNode.__isLeaf = false;

                    dupNode[options.childrenAttrib] = null;

                    $scope.flatTree.push(dupNode);
                    var tree =  flattenTree($scope.tree); 
                    var arr=$scope.flatTree.concat(tree);
                    angular.copy(arr,$scope.flatTree);
                    //expand first node
                    expand(dupNode);
                }
          }
          
          
          //Make the flat array of the tree
          var flattenTree = function(node){
            var arr = [];
            if( node.__level === undefined)
            {
                node.__level = 0;
            }
            node.__isleaf = true
            if(node[options.childrenAttrib] && angular.isArray(node[options.childrenAttrib]))
            {
              node[options.childrenAttrib].forEach(function(n){
                node.__hasChildren = true;
                //make copy of this node because we are gng to remove the 
                //children and we do not want original tree to be affected.
                var nd = angular.copy(n);
                n.__level = node.__level + 1;
                nd.__isleaf = false;
                nd.__isHidden = true;
                nd.__isExpanded = false;
                nd.__isSelected = false;
                nd.__parent = node[options.idAttrib];
                nd.__level = n.__level;

                nd.__hasChildren = false;
                nd.__isLeaf = false;
                if(n[options.childrenAttrib] == null){
                        nd.__isLeaf = true;
                }
                else if (n[options.childrenAttrib].length > 0){
                        nd.__hasChildren = true;
                }


                nd[options.childrenAttrib] = null;
                arr.push(nd);
                //Recursive find for children of current tree node.
                var retArr = flattenTree(n);
                arr = arr.concat(retArr);
              });
            }
            return arr;
          };
          
          $scope.toggleNodeVisibility = function(node,event)
          {
            //Logic: If we are collapsing the node, then we need to hide all nodes in nodes's hierarchy. 
            // But if we are expanding it we shold only make the children visible and no all hierarchy
            node.__isExpanded = !node.__isExpanded;
            var hide = !node.__isExpanded;
            var goTillLeaf= false;
            if (event.ctrlKey==1 || event.altKey == 1){
                // Use windows.location or your link.
                goTillLeaf = true;
            }
            //because hide is always till leaf
            if(hide)
            {
              goTillLeaf = true;
            }
            setChildrenVisibility(node,hide, goTillLeaf)
          };
          
          $scope.toggleSelection = function(node,event){
            var currentVal = node.__isSelected;
            

            if (event.ctrlKey!=1 || event.altKey != 1){
                    if (!$scope.allowMultiSelect)
                    {
                        //if in single selection mode a selected node is selected again then do not process further
                        if(currentVal == true){
                          return;
                        }
                        unselectAll();
                }
            }

            var selected = [];
            $scope.flatTree.forEach(function(n){
              if(n[options.idAttrib] && n[options.idAttrib] == node[options.idAttrib])
              {
                n.__isSelected = !currentVal;  
              }
              if(n.__isSelected){
                  selected.push(n);
              }
            });

            //angular.copy(selected, $scope.selectedNodes);
            
            var trail = getParentTrail(selected[0]);
            $scope.parentTrail = trail.reverse();
            $scope.parentTrail.push(selected[0]);
            if ($scope.allowMultiSelect == true)
            {
                $scope.selectedNodes = selected;
            }
            else{
                $scope.selectedNodes = selected[0];
            }
            if($scope.onSelect)
            {
                $scope.onSelect(node);
            }
          };
          var expand = function(node)
          {
                node.__isExpanded = true;
                node.__isHidden = false;
                //since th4 parent is expanded ensure all its children also visible
                var c = getChildren(node);
                if(c == null){
                    return;
                }
                c.forEach(function(chld){
                        chld.__isHidden =false;
                });
          }

          var expandTo = function(node){
            var parents = getParentTrail(node);
            node.__isHidden = false;
            $scope.parentTrail = parents.reverse();
            $scope.parentTrail.push(node);
            parents.forEach(function(p){
                expand(p);
            });
          };

          var unselectAll = function()
          {
            $scope.flatTree.forEach(function(n){
                n.__isSelected = false;
              });
          }
          
          var setChildrenVisibility = function(node, isHidden, goTillLeaf)
          {
            var children = getChildren(node);
            if(!children)
            {
                return;
            }
            if(children.length < 0)
            {
                return;
            }
            children.forEach(function(n){
                n.__isHidden = isHidden;
                if(goTillLeaf)
                {
                  //check if we are going to open the children , if yes then this node must be expanded
                  node.__isExpanded = !isHidden;
                  setChildrenVisibility(n,isHidden,goTillLeaf);
                }
            });

            
          };
          //get children of this node
          var getChildren = function(node){
            var children = null;
            $scope.flatTree.forEach(function(n){
              if(n.__parent != null && n.__parent == node[options.idAttrib] ){

                  if(children == null){
                      children = [];
                  }
                  children.push(n);
              }
            });
            return children;
          };
            
          //get parent node 
          var getParent = function(node){
            var p = null;
            $scope.flatTree.forEach(function(n){
              if(n[options.idAttrib] && n[options.idAttrib] == node.__parent )
              {
                p=n;
              }
            });
            return p;
          };
          //get all predecessors of this node.
          var getParentTrail = function(node){
            var targetNode = null;

            $scope.flatTree.forEach(function(n){
              if(n[options.idAttrib] && n[options.idAttrib] == node[options.idAttrib])
              {
                targetNode=n;
              }
            });
            
            var parents = [];
            //find parents of the node
            var n = angular.copy(targetNode);
            var proceed = true;
            while(proceed){
                var p = getParent(n)

                if(p){
                    parents.push(p);
                    //now find parent of p;
                    n=angular.copy(p);
                }
                else{
                    proceed = false;
                }
            }
            return parents
          };

          $scope.$watch('tree', function(newValue, oldValue){
              if(newValue)
              {
                  init();
              }
          }, true);
          $scope.$watch('parentTrail', function(newValue, oldValue){
              if(newValue == oldValue)
              {
                  
              }
          });
          $scope.$watchCollection("selectedNodes", function (newValue, oldValue) {
            if (newValue) 
            {
                    //alert('selected changed');
              var ids =  [];
              if(angular.isArray(newValue) ){

              
                    for(var i=0;i<newValue.length;i++){
                        if(newValue[i][options.idAttrib])
                        {
                              var val = newValue[i][options.idAttrib];
                              if(val){
                                ids.push(val.toString());
                              }
                        }
                    }
                   
              }
              else {
                      var val = newValue[options.idAttrib];
                      if(val){
                        ids.push(val.toString());
                         
                      }
              }
              

              if($scope.flatTree)
              {
                $scope.flatTree.forEach(function(n){
                        if(n[options.idAttrib])
                        {
                            var id = n[options.idAttrib].toString();
                            n.__isSelected = ids.indexOf(id) >= 0;
                            if(n.__isSelected){
                                expandTo(n);
                            }    
                        }                    
                });
              }
              
              if ($scope.selectionChanged)
              {
                  $scope.selectionChanged();
              }
            }
              
          });

          
          init();
          
        }]//controller ends
            
      }}
  ]);//directive ends  
    
    
    
})();//closure ends
