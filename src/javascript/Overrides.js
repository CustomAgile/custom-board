Ext.override(Rally.ui.cardboard.CardBoard, {
    _buildColumnsFromModel: function () {
        var model = this.getModel();
        if (model) {
            var attribute = model.getField(this.attribute);
            if (attribute) {
                if (this.attribute === 'Project') {
                    Rally.getApp()._getCurrentProjectHierarchyForBoardColumns().then({
                        scope: this,
                        success: function (retrievedColumns) {
                            this.fireEvent('columnsretrieved', this, retrievedColumns);
                            this.columnDefinitions = [];
                            this._toggleMask(true);
                            _.each(retrievedColumns, this.addColumn, this);
                            this.renderColumns();
                        }
                    });

                }
                else {
                    attribute.getAllowedValueStore().load({
                        requester: this,
                        callback: function (records, operation, success) {
                            var retrievedColumns = _.map(records, function (allowedValue) {
                                var displayValue, value = allowedValue.get('StringValue');

                                if (!value && attribute.attributeDefinition.AttributeType.toLowerCase() === 'rating') {
                                    value = "None";
                                } else if (attribute.attributeDefinition.AttributeType.toLowerCase() === 'object') {
                                    displayValue = value;
                                    value = allowedValue.get('_ref');
                                    if (value === 'null') {
                                        value = null;
                                    }
                                }

                                return {
                                    value: value,
                                    columnHeaderConfig: {
                                        headerTpl: displayValue || value || 'None'
                                    }
                                };
                            });

                            this.fireEvent('columnsretrieved', this, retrievedColumns);
                            this.columnDefinitions = [];
                            this._toggleMask(true);
                            _.each(retrievedColumns, this.addColumn, this);
                            this.renderColumns();
                        },
                        scope: this
                    });
                }
            }
        }
    },
});