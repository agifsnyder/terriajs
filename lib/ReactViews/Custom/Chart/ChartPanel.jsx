'use strict';

import React from 'react';

import defined from 'terriajs-cesium/Source/Core/defined';

import Chart from './Chart.jsx';
import ChartPanelDownloadButton from './ChartPanelDownloadButton';
import Loader from '../../Loader.jsx';
import ObserveModelMixin from '../../ObserveModelMixin';
import Icon from "../../Icon.jsx";

import Styles from './chart-panel.scss';

const height = 250;

const ChartPanel = React.createClass({
    mixins: [ObserveModelMixin],

    propTypes: {
        terria: React.PropTypes.object.isRequired,
        onHeightChange: React.PropTypes.func,
        viewState: React.PropTypes.object.isRequired,
        animationDuration: React.PropTypes.number
    },

    closePanel() {
        const chartableItems = this.props.terria.catalog.chartableItems;
        for (let i = chartableItems.length - 1; i >= 0; i--) {
            const item = chartableItems[i];
            if (item.isEnabled && defined(item.tableStructure)) {
                item.tableStructure.columns
                    .filter(column=>column.isActive)
                    .forEach(column=>column.toggleActive());
            }
        }
    },

    componentDidUpdate() {
        if (defined(this.props.onHeightChange)) {
            this.props.onHeightChange();
        }
    },

    render() {
        const chartableItems = this.props.terria.catalog.chartableItems;
        let data = [];
        let xUnits;
        for (let i = chartableItems.length - 1; i >= 0; i--) {
            const item = chartableItems[i];
            if (item.isEnabled && defined(item.tableStructure)) {
                const thisData = item.chartData();
                if (defined(thisData)) {
                    data = data.concat(thisData);
                    xUnits = defined(xUnits) ? xUnits : item.xAxis.units;
                }
            }
        }

        const isLoading = (chartableItems.length > 0) && (chartableItems[chartableItems.length - 1].isLoading);
        const isVisible = (data.length > 0) || isLoading;

        this.props.terria.currentViewer.notifyRepaintRequired();

        if (!isVisible) {
            return null;
        }
        let loader;
        let chart;
        if (isLoading) {
            loader = <Loader className={Styles.loader}/>;
        }
        if (data.length > 0) {
            // TODO: use a calculation for the 34 pixels taken off...
            chart = (
                <Chart data={data} axisLabel={{x: xUnits, y: undefined}} height={height - 34}/>
            );
        }
        return (
            <div
                className={Styles.holder}>
                <div className={Styles.inner}>
                    <div className={Styles.chartPanel} style={{height: height}}>
                        <div className={Styles.body}>
                            <div className={Styles.header}>
                                <label className={Styles.sectionLabel}>{loader || 'Charts'}</label>
                                <ChartPanelDownloadButton chartableItems={this.props.terria.catalog.chartableItems} errorEvent={this.props.terria.error} />
                                <button type='button' className={Styles.btnCloseChartPanel} onClick={this.closePanel}>
                                    <Icon glyph={Icon.GLYPHS.close}/>
                                </button>
                            </div>
                            <div className={Styles.chart}>
                                {chart}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = ChartPanel;
