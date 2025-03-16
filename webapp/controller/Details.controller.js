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
    "sap/ui/core/date/UI5Date"],
    (Controller, JSONModel, Fragment, syncStyleClass, FilterOperator, Filter, MessageBox, MessageToast, BusyDialog, UI5Date) => {
        "use strict";
        var that, oView;
        return Controller.extend("zlistreport.controller.Details",
            {
                _data: {
                    // current date in "yyyy-MM-dd" format
                    date: UI5Date.getInstance().toISOString()
                },
                onInit() {
                    debugger;
                    that = this;
                    oView = that.getView();
                    that.i18nBundle = that.getOwnerComponent().getModel("i18n").getResourceBundle();
                    var oFormModel = new JSONModel([]);
                    oView.setModel(oFormModel, "oFormModel")
                    that.oRouter = that.getOwnerComponent().getRouter();
                    that.oRouter.getRoute("RouteDetails").attachPatternMatched(that.onDetailRouteMatched, that);

                    // set explored app's demo model on this sample
                    // var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/supplier.json"));
                    // oView.setModel(oModel);



                },
                onDetailRouteMatched: function (oEvt) {
                    debugger;
                    that.orderId = oEvt.getParameter("arguments").ordrId;
                    // debugger;
                    that.orderPath = oEvt.getParameter("arguments").ordrPath;
                    that.getAllOrderDetails();

                },
                bindElement: function () {


                    // oView.byId("FormDisplay354wideDual").setModel(oView.getModel("oFormModel"));
                    // oView.byId("FormDisplay354wideDual").bindElement({ path: "/"+that.orderPath, model: "oFormModel" });
                    debugger;
                    console.log("Binding to index:", that.orderPath);
                    oView.unbindElement();
                    oView.bindElement({
                        path: "/" + that.orderPath,
                        model: "oFormModel"
                    });

                    this._formFragments = {};

                    // Set the initial .36form to be the display one
                    this._showFormFragment("Display");
                },
                getAllOrderDetails: function () {
                    // debugger;
                    var oModel = that.getOwnerComponent().getModel();
                    var sPath = "/Orders";
                    var oBusyDialog = new BusyDialog();
                    oBusyDialog.open();
                    oModel.read(sPath, {
                        success: function (oData) {

                            oView.getModel("oFormModel").setData(oData.results);
                            console.log("Loaded orders:", oView.getModel("oFormModel").getData());
                            console.log(oView.getModel("oFormModel").getData()[13].OrderDate);
                            console.log("type of oView.getModel(oFormModel).getData()[13].OrderDate: ", typeof(oView.getModel("oFormModel").getData()[13].OrderDate));
                            oView.getModel("oFormModel").refresh();
                            oBusyDialog.close();
                            debugger;
                            that.bindElement();
                        },
                        error: function (oerror) {
                            oBusyDialog.close();
                            console.log(oerror);
                        }
                    });
                },
                getOrderDetailsFromOrderId: function (orderId) {
                    debugger;
                    var oModel = that.getOwnerComponent().getModel();

                    var sPath = "/Orders(" + orderId + ")";
                    var oBusyDialog = new BusyDialog();
                    oBusyDialog.open();
                    oModel.read(sPath, {
                        success: function (oData) {
                            // debugger;
                            oView.getModel("oFormModel").setData([oData]);
                            oView.getModel("oFormModel").refresh();
                            oBusyDialog.close();
                            debugger;
                            that.bindElement();
                        },
                        error: function (oerror) {
                            oBusyDialog.close();
                            debugger;
                        }
                    });
                },
                onNavToApp: function () {
                    debugger;
                    // that.handleCancelPress()
                    that.getOwnerComponent().onNavBack("RouteApp");
                    // const oHistory = History.getInstance();
                    // const sPreviousHash = oHistory.getPreviousHash();

                    // if (sPreviousHash !== undefined) {
                    // 	window.history.go(-1);
                    // } else {
                    // 	const oRouter = this.getOwnerComponent().getRouter();
                    // 	oRouter.navTo("RouteApp", {}, true);
                    // }
                },
                handleEditPress: function () {
                    debugger;
                    //Clone the data
                    var oModel = oView.getModel("oFormModel");
                    var oData = oModel.getData();
                    this._oSupplier = Object.assign({}, oData[that.orderPath]);

                    this._toggleButtonsAndView(true);

                },

                handleCancelPress: function () {
                    debugger;
                    //Restore the data
                    var oModel = oView.getModel("oFormModel");
                    var oData = oModel.getData();
                    oData[that.orderPath] = this._oSupplier;
                    oModel.setData(oData);
                    this._toggleButtonsAndView(false);

                },

                handleSavePress: function () {
                    debugger;
                    this._toggleButtonsAndView(false);

                },

                _toggleButtonsAndView: function (bEdit) {
                    debugger;
                    var oView = this.getView();

                    // Show the appropriate action buttons
                    oView.byId("edit").setVisible(!bEdit);
                    oView.byId("save").setVisible(bEdit);
                    oView.byId("cancel").setVisible(bEdit);

                    // Set the right form type
                    this._showFormFragment(bEdit ? "Change" : "Display");
                },

                _getFormFragment: function (sFragmentName) {
                    debugger;
                    var pFormFragment = this._formFragments[sFragmentName],
                        oView = this.getView();
                    debugger;
                    if (!pFormFragment) {
                        pFormFragment = Fragment.load({
                            id: oView.getId(),
                            name: "zlistreport.view." + sFragmentName
                        });
                        this._formFragments[sFragmentName] = pFormFragment;
                    }
                    debugger;
                    return pFormFragment;
                },

                _showFormFragment: function (sFragmentName) {
                    debugger;
                    var oPage = this.byId("detailpage");

                    oPage.removeAllContent();

                    this._getFormFragment(sFragmentName).then(function (oVBox) {
                        // Use the current binding context of the view
                        oVBox.setBindingContext(oView.getBindingContext());
                        oPage.insertContent(oVBox);
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