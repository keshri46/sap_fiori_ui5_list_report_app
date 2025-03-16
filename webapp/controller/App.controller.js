sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/core/syncStyleClass",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/BusyDialog"


], (Controller, JSONModel, Fragment, syncStyleClass, FilterOperator, Filter, MessageBox, MessageToast, BusyDialog) => {
    "use strict";
    var that, oView;
    return Controller.extend("zlistreport.controller.App", {
        onInit() {
            that = this;
            oView = that.getView();
            that.i18nBundle = that.getOwnerComponent().getModel("i18n").getResourceBundle();
            oView.byId("tabTitle").setText(that.i18nBundle.getText("purOrder", 0));

            // Model for the search data
            var oOrdersModel = new JSONModel();
            oView.setModel(oOrdersModel, "OrdersModel");

            this.aSearchFields = [
                "CustomerID",
                // "OrderDate",
                "ShipVia",
                "ShipName",
                "ShipAddress",
                "ShipCity",
                "OrderID",
                "ShipCountry"
            ];

            // that.oSProperty = "";
            // // Model to store UI state including selected search columns and search query
            // var oViewModel = new JSONModel({
            //     selectedColumns: ["CustomerID"],
            //     searchQuery: ""
            // });
            // oView.setModel(oViewModel, "viewModel");

            that.oRouter = that.getOwnerComponent().getRouter();
            that.oRouter.getRoute("RouteApp").attachPatternMatched(that.onAppRouteMatched, that);
            // that.loadNorthwindData();
        },
        onAppRouteMatched : function(){
            that.loadNorthwindData();
        },
        loadNorthwindData: function () {
            // debugger;
            var oModel = that.getOwnerComponent().getModel();
            var sPath = "/Orders";
            var oBusyDialog = new BusyDialog();
            oBusyDialog.open();
            oModel.read(sPath, {
                success: function (oData) {
                    
                    let res = oData.results.map(function (val) {
                        val.OrderID = String(val.OrderID);
                        val.ShipVia = String(val.ShipVia);
                        val.EmployeeID = String(val.EmployeeID);
                        // debugger;
                        return val;
                    });
                    oView.byId("tabTitle").setText(that.i18nBundle.getText("purOrder", res.length));
                    oView.getModel("OrdersModel").setData(res);
                    oView.getModel("OrdersModel").setSizeLimit(1000);
                    oView.getModel("OrdersModel").refresh();
                    oBusyDialog.close();
                },
                error: function (oerror) {
                    oBusyDialog.close();
                    // debugger;
                }
            });
        },

        onItemSelected: function (oEvt) {
            // oEvt.getParameter("item") returns the MenuItem that was selected.
            var oItem = oEvt.getParameter("item");
            var sItemText = oItem.getText();

            debugger;
            // Determine the originating MenuItemGroup by its ID
            // (Since you loaded the fragment with the view’s ID as prefix,
            //  you can use the fragment’s byId method to retrieve groups.)
            var oColMenuGroup = that._oMenuFragment.byId("colmenuitemgroup");
            var oSelectClearGroup = this._oMenuFragment.byId("selectallclearallgroup");

            // Check if the event comes from the select-all/clear-all group
            if (oItem.getParent().getId().indexOf("selectallclearallgroup") !== -1) {
                if (sItemText === "Select All") {
                    // Set all items in colmenuitemgroup as selected
                    oColMenuGroup.getItems().forEach(function (oMenuItem) {
                        oMenuItem.setSelected(true);
                    });
                    // Update the model with all column names
                    var aAllColumns = oColMenuGroup.getItems().map(function (oMenuItem) {
                        return oMenuItem.getText();
                    });
                    // Ensure CustomerID is included (by default)
                    if (aAllColumns.indexOf("CustomerID") === -1) {
                        aAllColumns.push("CustomerID");
                    }
                    this.getView().getModel("viewModel").setProperty("/selectedColumns", aAllColumns);
                } else if (sItemText === "Clear All") {
                    // Deselect all items in colmenuitemgroup except CustomerID
                    oColMenuGroup.getItems().forEach(function (oMenuItem) {
                        if (oMenuItem.getText() === "CustomerID") {
                            oMenuItem.setSelected(true);
                        } else {
                            oMenuItem.setSelected(false);
                        }
                    });
                    this.getView().getModel("viewModel").setProperty("/selectedColumns", ["CustomerID"]);
                }
            } else {
                // Event from the colmenuitemgroup: update the model based on current selections
                var aSelectedColumns = oColMenuGroup.getItems().filter(function (oMenuItem) {
                    return oMenuItem.getSelected();
                }).map(function (oMenuItem) {
                    return oMenuItem.getText();
                });
                // If nothing is selected, force CustomerID as default
                if (aSelectedColumns.length === 0) {
                    aSelectedColumns.push("CustomerID");
                    // Also update the UI for CustomerID item
                    oColMenuGroup.getItems().forEach(function (oMenuItem) {
                        if (oMenuItem.getText() === "CustomerID") {
                            oMenuItem.setSelected(true);
                        }
                    });
                }
                this.getView().getModel("viewModel").setProperty("/selectedColumns", aSelectedColumns);
            }
            debugger;
        },


        onClosed: function (oEvt) {
            // debugger
        },

        onPress: function () {
            // var oView = this.getView(),
            var oButton = oView.byId("button");
        
            if (!this._oMenuFragment) {
                this._oMenuFragment = Fragment.load({
                    id: oView.getId(),
                    name: "zlistreport.view.MenuColumn",
                    controller: this
                }).then(function (oMenu) {
                    oMenu.openBy(oButton);
                    this._oMenuFragment = oMenu;
                    // Access the MultiSelect MenuItemGroup by its fragment id.
                    // Note: When using fragments, the id is prefixed by the view id.
                    var oMultiSelectGroup = sap.ui.core.Fragment.byId(this.getView().getId(), "colmenuitemgroup");
                    var aMenuItems = oMultiSelectGroup.getItems();

                    aMenuItems.forEach(function (oMenuItem) {
                        // If the MenuItem supports selection, set it as selected.
                        if (oMenuItem.setSelected) {
                            oMenuItem.setSelected(true);
                        }

                        // Retrieve the custom data key(s) for the MenuItem.
                        oMenuItem.getCustomData().forEach(function (oCustomData) {
                            var sKey = oCustomData.getKey();
                            console.log("CustomData key:", sKey);
                        });
                    });
                    return this._oMenuFragment;
                }.bind(this));
            } else {
                this._oMenuFragment.openBy(oButton);
            }
            console.log(oView.byId("orderiditem"));
            console.log(typeof (oView.byId("orderiditem")));
            debugger;
        },

        /*
        searchOrder: function(oEvt) {
            // Retrieve the query string (from search or liveChange)
            var sQuery = oEvt.getParameter("query") || oEvt.getParameter("newValue") || "";
        
            // Update the view model's searchQuery (used for highlighting later)
            this.getView().getModel("viewModel").setProperty("/searchQuery", sQuery.toLowerCase());
        
            // Get the table binding for the Orders table
            var oTable = this.getView().byId("idOrdersTable");
            var oBinding = oTable.getBinding("items");
        
            // If query is empty, clear filters and return
            if (!sQuery) {
                oBinding.filter([]);
                return;
            }
        
            // Convert query to lower case for case-insensitive matching
            sQuery = sQuery.toLowerCase();
        
            // Get the list of selected columns from the viewModel; fallback to CustomerID if none
            var aSearchFields = this.getView().getModel("viewModel").getProperty("/selectedColumns") || ["CustomerID"];
        
            // Helper function: create a custom filter for each selected field
            var createCustomFilter = function(sField) {
                return new sap.ui.model.Filter({
                    path: sField,
                    test: function(value) {
                        if (value !== null && value !== undefined) {
                            return value.toString().toLowerCase().indexOf(sQuery) !== -1;
                        }
                        return false;
                    }
                });
            };
        
            // Build filters only for the selected fields
            var aFilters = aSearchFields.map(createCustomFilter);
        
            // Combine the filters with OR logic
            var oGlobalFilter = new sap.ui.model.Filter({
                filters: aFilters,
                and: false
            });
        
            // Apply the filter to the table binding
            oBinding.filter(oGlobalFilter);
        }
        


        */

        searchOrder: function (oEvt) {
            var sQuery = oEvt.getParameter('query') ? oEvt.getParameter("query") : oEvt.getParameter("newValue");

            // Single Column filter
            // var oFilter = new Filter("CustomerID", FilterOperator.Contains, sQuery);
            // var allFilters = [
            //     new Filter("CustomerID", FilterOperator.Contains, sQuery),
            //     new Filter("ShipName", FilterOperator.Contains, sQuery),
            //     new Filter("ShipAddress", FilterOperator.Contains, sQuery),
            //     new Filter("ShipCity", FilterOperator.Contains, sQuery),
            //     new Filter("ShipCountry", FilterOperator.Contains, sQuery),
            //     new Filter("OrderID", FilterOperator.Contains, sQuery),
            //     new Filter("ShipVia", FilterOperator.Contains, sQuery)
            // ]
            // var oFilter = new Filter({
            //     filters: allFilters,
            //     and: false
            // });
            // Helper function to create a custom filter for a field
            // var createCustomFilter = function (sField) {
            //     return new sap.ui.model.Filter({
            //         path: sField,
            //         test: function (value) {
            //             // Ensure the value exists; convert to string (if not already) and check
            //             if (value !== null && value !== undefined) {
            //                 return value.toString().toLowerCase().indexOf(sQuery) !== -1;
            //             }
            //             return false;
            //         }
            //     });
            // };

            var createCustomFilter = function (sField) {
                return new Filter(sField, FilterOperator.Contains, sQuery);
            }
            // debugger;
            // Build an array of custom filters (one for each field)
            var aFilters = that.aSearchFields.map(function (sField) {
                return createCustomFilter(sField);
            });

            // Combine the filters using OR logic (and: false means OR)
            var oGlobalFilter = new Filter({
                filters: aFilters,
                and: false
            });
            // debugger;
            oView.byId("idOrdersTable").getBinding("items").filter(oGlobalFilter);

        },
        onSearchCustomerLiveChange: function (oEvt) {
            var sQuery = oEvt.getParameter("newValue");
            console.log("onSearchCustomerLiveChange query : "+sQuery);
            
            var oFilter = new Filter("CustomerID", FilterOperator.Contains, sQuery);
            oView.byId("idOrdersTable").getBinding("items").filter(oFilter);

        },
        onSearchOrderLiveChange: function (oEvt) {
            var sQuery = oEvt.getParameter("newValue");
            console.log("onSearchOrderLiveChange query : "+sQuery);
            
            var oFilter = new Filter("OrderID", FilterOperator.Contains, sQuery);
            oView.byId("idOrdersTable").getBinding("items").filter(oFilter);

        },
        onAddNewOrder:function(oEvt){
            console.log(oEvt.getSource());
            oView.byId("saveOrders").setEnabled(true);
        },
        onDeleteOrder:function name(oEvt) {
            console.log(oEvt.getSource());
            
        },
        onSaveClicked:function name(oEvt) {
            console.log(oEvt.getSource());
            
        },
        open: function (oEvt) {
            // debugger
            var sPath = oEvt.getSource().getBindingContextPath();
            var orderId = oView.getModel("OrdersModel").getProperty(sPath).OrderID;
            sPath = sPath.replace('/','');
            console.log(orderId);
            console.log(sPath);
            debugger;
            that.oRouter.navTo("RouteDetails",{
                ordrPath : sPath,
                ordrId : orderId
            });
        },
        formatter: {
            formatDate: function(oDate) {
                if (oDate) {
                    var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                        pattern: "dd-MM-yyyy"
                    });
                    return oDateFormat.format(new Date(oDate));
                }
                return "";
            }
        }
    });
});