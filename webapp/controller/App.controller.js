sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/core/syncStyleClass",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/BusyDialog",
    "zlistreport/util/Formatter"
], (Controller, JSONModel, Fragment, syncStyleClass, FilterOperator, Filter, MessageBox, MessageToast, BusyDialog, Formatter, ODataUtils) => {
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

        onAppRouteMatched: function () {
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
                        val.isNew = false;
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
            console.log("onSearchCustomerLiveChange query : " + sQuery);

            var oFilter = new Filter("CustomerID", FilterOperator.Contains, sQuery);
            oView.byId("idOrdersTable").getBinding("items").filter(oFilter);

        },

        onSearchOrderLiveChange: function (oEvt) {
            var sQuery = oEvt.getParameter("newValue");
            console.log("onSearchOrderLiveChange query : " + sQuery);

            var oFilter = new Filter("OrderID", FilterOperator.Contains, sQuery);
            oView.byId("idOrdersTable").getBinding("items").filter(oFilter);

        },

        onAddNewOrder: function (oEvt) {
            // console.log(oEvt.getSource());
            oView.byId("saveOrders").setEnabled(true);

            var oModel = this.getView().getModel("OrdersModel");
            var aData = oModel.getProperty("/");  // Get the existing data
            // console.log(aData);
            // console.log(oModel);


            const oNewRecord = structuredClone(aData[0]);
            // console.log(oNewRecord);
            oNewRecord.isNew = true;
            oNewRecord.OrderID = "";
            oNewRecord.CustomerID = "";
            oNewRecord.ShipVia = "";
            oNewRecord.ShipName = "";
            oNewRecord.ShipAddress = "";
            oNewRecord.ShipCity = "";
            oNewRecord.ShipCountry = "";

            var oDate = new Date();
            console.log(typeof (oDate));
            // var oFormattedDate = ODataUtils.formatValue(oDate, "Edm.DateTime");
            console.log(typeof (oFormattedDate));


            oNewRecord.OrderDate = new Date();

            // Create a blank row with `isNew: true`
            // var oNewRecord = {
            // OrderID: "",
            // CustomerID: "",
            // OrderDate: "",
            // ShipVia: "",
            // ShipName: "",
            // ShipAddress: "",
            // ShipCity: "",
            // ShipCountry: "",
            //     isNew: true // Flag to identify new records
            // };

            // Add the new record at index 0
            aData.unshift(oNewRecord);

            // Update the model with new data
            oModel.setProperty("/", aData);
            oModel.refresh(true); // Force UI update
            console.log("Updated Data:", oModel.getProperty("/"));

        },

        onDeleteOrderPress: function name(oEvent) {
            console.log(oEvent.getSource());


            var oView = this.getView();
            var oModel = oView.getModel("OrdersModel"); // Local JSON model
            var oODataModel = this.getOwnerComponent().getModel(); // OData model

            var oItemContext = oEvent.getSource().getBindingContext("OrdersModel");

            if (!oItemContext) {
                MessageBox.error("Could not determine the selected order.");
                return;
            }

            var sOrderId = oItemContext.getProperty("OrderID");

            if (!sOrderId) {
                MessageBox.error("Invalid Order ID. Cannot delete this record.");
                return;
            }

            MessageBox.confirm("Are you sure you want to delete this order?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        // **Remove order from local UI model first**
                        var aOrders = oModel.getProperty("/");
                        var aUpdatedOrders = aOrders.filter(function (oOrder) {
                            return oOrder.OrderID !== sOrderId;
                        });

                        oModel.setProperty("/", aUpdatedOrders);
                        oModel.refresh();

                        var oBusyDialog = new sap.m.BusyDialog();
                        oBusyDialog.open();

                        // Ensure batch mode is disabled
                        oODataModel.setUseBatch(false);

                        // **Backend delete request**
                        var sPath = "/Orders(" + sOrderId + ")";

                        oODataModel.remove(sPath, {
                            success: function () {
                                oBusyDialog.close();
                                MessageToast.show("Order deleted successfully!");
                            },
                            error: function (oError) {
                                oBusyDialog.close();
                                console.error("Delete Error:", oError);
                                MessageBox.error("Error : 403");
                            }
                        });
                    }
                }
            });
        },

        onSaveClicked: function name(oEvt) {
            console.log(oEvt.getSource());

            var oView = this.getView();
            var oOrdersModel = oView.getModel("OrdersModel");
            var oDataModel = this.getOwnerComponent().getModel(); // Main ODataModel

            var aData = oOrdersModel.getData();
            var oNewOrder = aData[0];

            delete oNewOrder.isNew;
            console.log(oNewOrder);

            // var oDataModel = this.getOwnerComponent().getModel();
            // Gather data from inputs (ensure you have input fields bound in your view)
            // var oNewOrder = {
            //     CustomerID: this.byId("customerIdInput").getValue(),
            //     EmployeeID: parseInt(this.byId("employeeIdInput").getValue(), 10),
            //     OrderDate: this.byId("orderDateInput").getValue(), // ensure correct format
            //  ... include additional properties as needed
            // };

            var oBusyDialog = new BusyDialog();
            oBusyDialog.open();

            // Ensure batch mode is disabled to avoid Content-ID error
            oDataModel.setUseBatch(false);

            oDataModel.create("/Orders", oNewOrder, {
                success: function (oData) {
                    oBusyDialog.close();
                    MessageBox.show("Order created successfully.");
                    console.log("Order created successfully. : ", oData);
                },
                error: function (oError) {
                    oBusyDialog.close();
                    MessageBox.error("Error creating order.");
                    console.log("Error creating order. : ", oError);
                }
            });
        },

        onUpdateOrderPress: function (oEvent) {

            console.log(oEvent.getSource());

            // Get the binding context for the selected row
            var oContext = oEvent.getSource().getBindingContext("OrdersModel");
            var sPath = oContext.getPath();
            
            var oOrdersModel = this.getView().getModel("OrdersModel");
            var oUpdatedData = oOrdersModel.getProperty(sPath);

            oUpdatedData.isNew = true;

        
            oOrdersModel.refresh(true); // Force UI update

            // Optionally, show a confirmation dialog before update
            sap.m.MessageBox.confirm("Are you sure you want to update this order?", {
                title: "Confirm Update",
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        var oDataModel = this.getView().getModel();
                        oDataModel.update(sPath, oUpdatedData, {
                            success: function () {
                                sap.m.MessageToast.show("Order updated successfully.");
                            },
                            error: function () {
                                sap.m.MessageToast.show("Error updating order.");
                            }
                        });
                    }
                }.bind(this)
            });
        },


        open: function (oEvt) {
            // debugger
            var sPath = oEvt.getSource().getBindingContextPath();
            var orderId = oView.getModel("OrdersModel").getProperty(sPath).OrderID;
            sPath = sPath.replace('/', '');
            console.log(orderId);
            console.log(sPath);
            debugger;
            that.oRouter.navTo("RouteDetails", {
                ordrPath: sPath,
                ordrId: orderId
            });
        },

        onValueHelpRequestOrder: function (oEvent) {
            var sInputValue = oEvent.getSource().getValue(),
                oView = this.getView();

            if (!this._pValueHelpDialogOrder) {
                this._pValueHelpDialogOrder = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "zlistreport.view.ValueHelpDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueHelpDialogOrder.then(function (oDialog) {
                // Create a filter for OrderID using the input value
                var oFilter = new sap.ui.model.Filter("OrderID", sap.ui.model.FilterOperator.Contains, sInputValue);
                oDialog.getBinding("items").filter([oFilter]);
                // Open the dialog with the current input value as a parameter if needed
                oDialog.open(sInputValue);
            });
        },

        onValueHelpSearchOrder: function (oEvent) {
            debugger;
            var sValue = oEvent.getParameter("value");
            var oFilter = new sap.ui.model.Filter("OrderID", sap.ui.model.FilterOperator.Contains, sValue);
            oEvent.getSource().getBinding("items").filter([oFilter]);
            //
        },

        onValueHelpCloseOrder: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            // Clear filter after closing
            oEvent.getSource().getBinding("items").filter([]);
            if (!oSelectedItem) {
                return;
            }
            // Set the selected OrderID value into the appropriate input field
            this.byId("orderInput").setValue(oSelectedItem.getTitle());
        },

        onValueHelpRequestCustomer: function (oEvent) {
            var sInputValue = oEvent.getSource().getValue(),
                oView = this.getView();

            if (!this._pValueHelpDialogCustomer) {
                this._pValueHelpDialogCustomer = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "zlistreport.view.ValueHelpDialogCustomer",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueHelpDialogCustomer.then(function (oDialog) {
                // Create a filter for CustomerID using the input value
                var oFilter = new sap.ui.model.Filter("CustomerID", sap.ui.model.FilterOperator.Contains, sInputValue);
                oDialog.getBinding("items").filter([oFilter]);
                oDialog.open(sInputValue);
            });
        },

        onValueHelpSearchCustomer: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new sap.ui.model.Filter("CustomerID", sap.ui.model.FilterOperator.Contains, sValue);
            oEvent.getSource().getBinding("items").filter([oFilter]);
        },

        onValueHelpCloseCustomer: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            oEvent.getSource().getBinding("items").filter([]);
            if (!oSelectedItem) {
                return;
            }
            // Set the selected CustomerID value into the appropriate input field
            this.byId("customerInput").setValue(oSelectedItem.getTitle());
        }

    });
});