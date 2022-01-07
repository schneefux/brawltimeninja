"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.OptionalVisualisationProps = exports.VisualisationProps = exports.asSlice = exports.asStringMeasurements = exports.asNumberMeasurements = exports.asDimensions = void 0;
// helper function which infers keys and restricts values to ElementType
var asDimensions = function (et) { return et; };
exports.asDimensions = asDimensions;
var asNumberMeasurements = function (et) { return et; };
exports.asNumberMeasurements = asNumberMeasurements;
var asStringMeasurements = function (et) { return et; };
exports.asStringMeasurements = asStringMeasurements;
var asSlice = function (et) { return et; };
exports.asSlice = asSlice;
/**
 * Props definition for visualisation components
 */
exports.VisualisationProps = {
    card: {
        type: undefined,
        required: false
    },
    loading: {
        type: Boolean,
        required: true
    },
    response: {
        type: Object,
        required: true
    }
};
/**
 * Props definition for visualisation or static components
 */
exports.OptionalVisualisationProps = __assign(__assign({}, exports.VisualisationProps), { loading: {
        type: Boolean,
        required: false
    }, response: {
        // @ts-ignore
        type: Object,
        required: false
    } });
