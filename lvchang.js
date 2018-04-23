'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();

var _get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ("value" in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};

var _jQuery = require('jQuery');

var _jQuery2 = _interopRequireDefault(_jQuery);

var _lodash = require('../../plugin/lodash/lodash-4.17.5.min');

var _lodash2 = _interopRequireDefault(_lodash);

var _base2 = require('./base');

var _base3 = _interopRequireDefault(_base2);

var _Tab = require('./Tab');

var _Tab2 = _interopRequireDefault(_Tab);

var _httpRequest = require('httpRequest');

var _httpRequest2 = _interopRequireDefault(_httpRequest);

var _sysConfig = require('../../../config/sysConfig');

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
/**
 * CoinSelect
 * Created by lvchang
 * Created on 2018\4\9 0009 16:07.
 */

var config = function config(options) {
    _classCallCheck(this, config);

    options = options || {};
    this.eles = {
        body: 'body'
    };
    this.eventsMap = {
        'click .J_currency': 'collectCurrencyEvent',
        'input .J_search': 'searchEvent',
        'propertychange .J_search': 'searchEvent',
        'click .J_sort': 'sortEvent'
    };
};


var CoinSelect = function (_base) {
    _inherits(CoinSelect, _base);

    function CoinSelect(options) {
        _classCallCheck(this, CoinSelect);

        var _this = _possibleConstructorReturn(this, (CoinSelect.__proto__ || Object.getPrototypeOf(CoinSelect)).call(this, options));

        _get(CoinSelect.prototype.__proto__ || Object.getPrototypeOf(CoinSelect.prototype), 'bindEvent', _this).call(_this);
        _this.selectFreeIdGroup = []; // 收藏币种的缓存
        _this.allData = []; // 所有数据缓存
        _this.currentTabIndex = -1; // 当前高亮tab索引缓存
        _this.sortType = ''; // 排序方式缓存
        _this.sequence = 'ascend'; // 升序降序
        _this.sortTypeArr = { // 排序类型对应参数
            title: 'title',
            price: 'new_price',
            change: 'change_24h_value',
            volume: 'total_num_24h'
        };
        _this.sortIcon = { // 排序箭头图标
            ascend: '<i class="iconfont icon-sort">&#xe62f;</i>',
            descend: '<i class="iconfont icon-sort">&#xe630;</i>'
        };
        _this.market = { // 市场哈希
            BTC: 29,
            ETH: 1
        };
        _this.icon = { // 收藏图标
            unselected: '<i class="iconfont icon-collect">&#xe78c;</i>',
            selected: '<i class="iconfont icon-collect selected">&#xe694;</i>'
        };
        _this.init();
        return _this;
    }

    _createClass(CoinSelect, [{
        key: 'init',
        value: function init() {
            var _this2 = this;

            // 获取收藏信息
            this.getOptionalData();

            // 初始化tab切换
            new _Tab2.default({
                root: '.J_tab',
                currentClass: 'cur',
                trigger: 'mouseover mouseout',
                leaveHidden: true,
                autoPlay: false,
                handler: function handler(n) {
                    _this2.tabHandler(n);
                }
            });
        }

        /**
         * tab回调
         * @param {number} idx - 高亮tab的索引值
         */

    }, {
        key: 'tabHandler',
        value: function tabHandler(idx) {
            var marketName = (0, _jQuery2.default)('.J_tab-menu').eq(idx).data('market');
            var keywords = (0, _jQuery2.default)('.J_tab-content').eq(idx).find('.J_search').val().toUpperCase();

            // 收藏币种加载
            if (marketName.toLowerCase() === 'optional') {
                this.getOptionalMsg(this.allData, idx, keywords);
            } else {
                // 市场分类加载
                this.getMarketMsg(this.allData, idx, keywords);
            }

            this.currentTabIndex = idx;
        }

        /**
         * 获取所有币种信息
         * @param {array} data
         */

    }, {
        key: 'getAllData',
        value: function getAllData(data) {
            this.allData = data;
        }

        /**
         * 更新币种信息
         * @param {object} data - 币种增量数据
         */

    }, {
        key: 'updateAllData',
        value: function updateAllData(data) {
            var currencyId = data.currencyId,
                currency_trade_id = data.currency_trade_id,
                info = data.info;

            var freeId = currencyId + '_' + currency_trade_id;
            var marketIndex = this.allData.findIndex(function (item) {
                return item.currency_trade_id == currency_trade_id;
            }); // FIXME: 后台格式不统一，暂时用==
            var listArr = this.allData[marketIndex].list;
            var currencyIndex = listArr.findIndex(function (item) {
                return item.currencyId == currencyId;
            });

            // 增量数据已存在，则更新已有数据和dom
            if (currencyIndex === -1) {
                this.allData[marketIndex].list.push({currencyId: currencyId, info: info});
            } else {
                // 增量数据是新增的，则push到数据和dom中
                this.allData[marketIndex].list[currencyIndex].info = info;
            }

            // 高亮tab的dom更新
            this.currentTabIndex > -1 && this.updateCurrencyDom(freeId, info, currencyIndex);
        }

        /**
         * 增量数据更新高亮tab的对应dom
         * @param {string} freeId - 币种id
         * @param {object} info - 币种id的信息
         * @param {number} currencyIndex - 币种id在初始数据中的索引值
         */

    }, {
        key: 'updateCurrencyDom',
        value: function updateCurrencyDom(freeId, info, currencyIndex) {
            var params = {
                currencyInfo: info, // 币种信息
                changeStyle: info.change_24h_value > 0 ? 'increase' : 'decrease', // 涨跌样式
                iconSelected: this.selectFreeIdGroup.indexOf(freeId) > -1 ? 'selected' : 'unselected', // 收藏状态
                freeId: freeId, // 币种id
                marketName: info.title.split('/')[1] // 市场名
            };
            var tabContent = '';
            tabContent = this.spliceCurrency(params, tabContent);
            var currencyDom = (0, _jQuery2.default)(tabContent).html();

            if (currencyIndex > -1) {
                (0, _jQuery2.default)('.J_tab-content').eq(this.currentTabIndex).find('[data-freeid=' + freeId + ']').html(currencyDom);
            } else {
                (0, _jQuery2.default)('.J_tab-content').eq(this.currentTabIndex).append(tabContent);
            }
        }

        /**
         * 加载市场分类列表
         * @param {array} data - 所有币种信息
         * @param {number} idx - tab索引值
         * @param {string} keywords - 搜索关键词
         */

    }, {
        key: 'getMarketMsg',
        value: function getMarketMsg(data, idx, keywords) {
            var _this3 = this;

            var marketName = (0, _jQuery2.default)('.J_tab-menu').eq(idx).data('market'); // 市场分类名
            var marketId = this.market[marketName];
            var dataIdx = data.findIndex(function (item) {
                return item.currency_trade_id === marketId;
            }); // 数据对应的索引值
            var params = {};
            var tabContent = ''; // tab内容页
            var freeId = void 0;
            var currencyName = void 0; // 币种名
            var sortData = void 0; // 排序后的数据

            // 添加排序图标
            this.sortType && this.addSortIcon(idx);

            // 拼接自选币种dom
            if (data[dataIdx]) {
                // 数据排序
                sortData = this.sortType ? this.sortCurrency(data[dataIdx].list, this.sortTypeArr[this.sortType], this.sequence) : data[dataIdx].list;

                sortData.forEach(function (item, i) {
                    freeId = item.currencyId + '_' + marketId;
                    currencyName = item.info.title.split('/')[0];
                    params = {
                        currencyInfo: item.info, // 币种信息
                        changeStyle: item.info.change_24h_value > 0 ? 'increase' : 'decrease', // 涨跌样式
                        iconSelected: _this3.selectFreeIdGroup.indexOf(freeId) > -1 ? 'selected' : 'unselected', // 收藏状态
                        freeId: freeId, // 币种id
                        marketName: marketName // 市场名
                    };

                    if (!keywords || currencyName.indexOf(keywords) !== -1) {
                        tabContent = _this3.spliceCurrency(params, tabContent);
                    }
                });
            }

            tabContent || (tabContent = '<tr><td class="no-data" colspan="5">无相关币种信息</td></tr>');
            (0, _jQuery2.default)('.J_tab-content').eq(idx).find('.J_coin-table tbody').html(tabContent);
        }

        /**
         * 加载币种收藏列表
         * @param {array} data - 所有币种信息
         * @param {number} idx - tab索引值
         * @param {keywords} keywords - 搜索关键词
         */

    }, {
        key: 'getOptionalMsg',
        value: function getOptionalMsg(data, idx, keywords) {
            var _this4 = this;

            this.getOptionalData();
            var formatCurrencyArr = this.formatCollectListSort(data, keywords); // 格式化自选数据，供排序用
            var tabContent = ''; // tab内容页
            var freeId = void 0; // 币种id
            var params = void 0;
            var currencyName = void 0; // 币种名

            // 添加排序图标和排序自选数据
            if (this.sortType) {
                this.addSortIcon(idx);
                formatCurrencyArr = this.sortCurrency(formatCurrencyArr, this.sortTypeArr[this.sortType], this.sequence);
            }

            // 拼接自选币种dom
            formatCurrencyArr.forEach(function (item, i) {
                currencyName = item.info.title.split('/')[0];
                freeId = item.currencyId + '_' + item.currency_trade_id;

                params = {
                    currencyInfo: item.info, // 币种信息
                    marketName: item.info.title.split('/')[1], // 市场分类名
                    changeStyle: item.info.change_24h_value > 0 ? 'increase' : 'decrease', // 涨跌样式
                    iconSelected: 'selected', // 按钮选择状态
                    freeId: freeId
                };

                tabContent = _this4.spliceCurrency(params, tabContent);
            });

            tabContent || (tabContent = '<tr><td class="no-data" colspan="5">您还未添加任何自选</td></tr>');
            (0, _jQuery2.default)('.J_tab-content').eq(idx).find('.J_coin-table tbody').html(tabContent);
        }

        /**
         * 表格标题添加排序图表
         * @param {number} idx - 高亮tab的索引值
         */

    }, {
        key: 'addSortIcon',
        value: function addSortIcon(idx) {
            var $sort = (0, _jQuery2.default)('.J_tab-content').eq(idx).find('.J_sort');
            $sort.find('i').remove().end().find('th').removeClass('selected').end().find('[data-type=' + this.sortType + ']').addClass('selected').append(this.sortIcon[this.sequence]);
        }

        /**
         * 排序
         * @param {array} arr - 数据数组
         * @param {string} type - 排序指标类型
         * @param {string} sequence - 升序/降序
         * @returns {array} - 排序后数据
         */

    }, {
        key: 'sortCurrency',
        value: function sortCurrency(arr, type, sequence) {
            var iterateesArr = { // 升序降序
                ascend: function ascend(val) {
                    return Number(val) ? Number(val) : val.charCodeAt(0);
                },
                descend: function descend(val) {
                    return Number(val) ? -Number(val) : -val.charCodeAt(0);
                }
            };
            return _lodash2.default.sortBy(arr, function (item) {
                var ret = item.info[type] === undefined ? 'n/a' : item.info[type];
                return iterateesArr[sequence](ret);
            });
        }

        /**
         * 拼接币种信息列表dom
         * @param {object} params - 币种动态参数
         * @param {string} str - 待拼接字符串
         * @returns {string} ret
         */

    }, {
        key: 'spliceCurrency',
        value: function spliceCurrency(params, str) {
            var freeId = params.freeId,
                iconSelected = params.iconSelected,
                currencyInfo = params.currencyInfo,
                changeStyle = params.changeStyle,
                marketName = params.marketName;

            var coin = currencyInfo.title.toLowerCase().split('/').join('_');
            var dataBundle = {
                freeId: freeId,
                coin: coin,
                icon: this.icon[iconSelected],
                title: currencyInfo.title || 'n/a',
                newPrice: currencyInfo.new_price || 'n/a',
                rmbPrice: currencyInfo.rmb_value ? '\uFFE5' + currencyInfo.rmb_value : 'n/a',
                changeStyle: changeStyle,
                change24hValue: currencyInfo.change_24h_value ? currencyInfo.change_24h_value + '%' : 'n/a',
                total24hValue: currencyInfo.total_num_24h ? '' + currencyInfo.total_num_24h + marketName : 'n/a'
            };
            var ret = str;
            ret += '' + ('<tr class="currency J_currency" data-freeid="' + dataBundle.freeId + '" data-coin="' + dataBundle.coin + '">\n        <td width="8%">' + dataBundle.icon + '</td>\n        <td width="17%">' + dataBundle.title + '</td>\n        <td width="30%">' + dataBundle.newPrice + '<span class="price-cn"> / ' + dataBundle.rmbPrice + '</span></td>\n        <td width="15%" class="' + dataBundle.changeStyle + '">' + dataBundle.change24hValue + '</td>\n        <td width="30%"><span class="currency-sum">' + dataBundle.total24hValue + '</span></td>\n      </tr>');
            return ret;
        }

        /**
         * 判断登陆状态
         * @returns {boolean}
         */

    }, {
        key: 'isLogin',
        value: function isLogin() {
            return sessionStorage.getItem('isLoginIn');
        }

        /**
         * 获取后台或缓存里的收藏币种
         */

    }, {
        key: 'getOptionalData',
        value: function getOptionalData() {
            var _this5 = this;

            if (this.isLogin()) {
                this.userId = sessionStorage.getItem('member_id');
                _httpRequest2.default.post(_sysConfig.sysConfig.marketCollectList, {member_id: this.userId}, false).then(function (res) {
                    if (res.status === 1) {
                        _this5.selectFreeIdGroup = res.data ? _this5.formatCollectList(res.data) : [];
                    }
                });
            } else {
                var localFreeId = localStorage.getItem('free_id') || '';
                this.selectFreeIdGroup = localFreeId ? localFreeId.split(',') : [];
            }
        }

        /**
         * 格式化市场收藏列表数据
         * 后台接口格式变更，添加此方法转换格式适配，与缓存数据格式保持一致
         * @param {object} data - 后台返回数据
         * @returns {Array} - 格式化数据
         */

    }, {
        key: 'formatCollectList',
        value: function formatCollectList(data) {
            if (data === {}) return [];
            var ret = []; // 格式化数据缓存
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                var _loop = function _loop() {
                    var keys = _step.value;

                    data[keys].forEach(function (item, i) {
                        ret.push(item + '_' + keys);
                    });
                };

                for (var _iterator = Object.keys(data)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    _loop();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return ret;
        }

        /**
         * 格式化市场收藏列表数据
         * 此格式化数据是供排序用
         * @param {array} data - 市场分类的所有初始数据
         * @param {string} keywords - 关键词过滤
         * @returns {Array} - 格式化数据
         */

    }, {
        key: 'formatCollectListSort',
        value: function formatCollectListSort(data, keywords) {
            var _this6 = this;

            var freeId = void 0;
            var currencyName = void 0;
            var currencyItem = {};
            var formatCurrencyArr = [];

            Array.isArray(data) && data.forEach(function (item, i) {
                for (var j = 0; j < item.list.length; j++) {
                    currencyName = item.list[j].info.title.split('/')[0];
                    freeId = item.list[j].currencyId + '_' + item.currency_trade_id; // 币种id

                    // 自选过滤
                    if (_this6.selectFreeIdGroup.indexOf(freeId) > -1) {
                        // 关键词过滤
                        if (!keywords || currencyName.indexOf(keywords) !== -1) {
                            currencyItem = item.list[j];
                            Object.assign(item.list[j], {currency_trade_id: item.currency_trade_id});
                            formatCurrencyArr.push(currencyItem);
                        }
                    }
                }
            });

            return formatCurrencyArr;
        }

        /**
         * 收藏币种事件
         * @param e
         */

    }, {
        key: 'collectCurrencyEvent',
        value: function collectCurrencyEvent(e) {
            var _this7 = this;

            e.stopPropagation();
            var target = e.target;

            var freeId = (0, _jQuery2.default)(target).closest('.J_currency').data('freeid');
            var index = (0, _jQuery2.default)(target).closest('.J_tab-content').index();
            var marketName = (0, _jQuery2.default)('.J_tab-menu').eq(index).data('market');
            var postFreeId = void 0;

            // 图标点击区域触发
            if ((0, _jQuery2.default)(target).hasClass('iconfont')) {
                // 取消收藏
                if (this.selectFreeIdGroup.indexOf(freeId) !== -1) {
                    postFreeId = this.selectFreeIdGroup.filter(function (item) {
                        return item !== freeId;
                    }).join(',');
                    this.collectSend({
                        id: freeId,
                        type: 0,
                        sendCallback: function sendCallback() {
                            _this7.cancelCollect({
                                e: e,
                                marketName: marketName,
                                postFreeId: postFreeId
                            });
                        },
                        storageCallback: function storageCallback() {
                            _this7.cancelCollect({
                                e: e,
                                marketName: marketName,
                                postFreeId: postFreeId,
                                cb: function cb() {
                                    localStorage.setItem('free_id', postFreeId);
                                }
                            });
                        }
                    });
                } else {
                    // 收藏
                    var currentSelectFreeIdGroup = this.selectFreeIdGroup;
                    currentSelectFreeIdGroup.push(freeId);
                    postFreeId = currentSelectFreeIdGroup.join(',');
                    this.collectSend({
                        id: freeId,
                        type: 1,
                        sendCallback: function sendCallback() {
                            _this7.collect(e, postFreeId);
                        },
                        storageCallback: function storageCallback() {
                            _this7.collect(e, postFreeId, function () {
                                localStorage.setItem('free_id', postFreeId);
                            });
                        }
                    });
                }
            } else {
                // 非图表区域连接跳转
                var coin = (0, _jQuery2.default)(target).closest('.J_currency').data('coin');
                window.location.href = './tradeCenter.html?coin=' + coin;
            }
        }

        /**
         * 请求收藏接口
         * @param {object} params - 参数对象
         * {string} id - 已收藏的freeId
         * {number} type - 收藏类型，0为取消收藏、1为收藏
         * {function} sendCallback - 登录状态的回调
         * {function} storageCallback - 非登录状态的回调
         */

    }, {
        key: 'collectSend',
        value: function collectSend(params) {
            var id = params.id,
                type = params.type,
                sendCallback = params.sendCallback,
                storageCallback = params.storageCallback;

            var currencyId = id.split('_')[0];
            var marketId = id.split('_')[1];
            if (this.isLogin()) {
                _httpRequest2.default.post(_sysConfig.sysConfig.marketCollect, {
                    member_id: this.userId,
                    currency_id: currencyId,
                    trade_currency_id: marketId,
                    collect_type: type
                }).then(function (res) {
                    if (res.status === 1) {
                        sendCallback();
                    }
                });
            } else {
                storageCallback();
            }
        }

        /**
         * 收藏操作
         * @param e
         * @param {string} id - 已收藏的freeId
         * @param {function} cb - 回调
         */

    }, {
        key: 'collect',
        value: function collect(e, id, cb) {
            var target = e.target;

            (0, _jQuery2.default)(target).parent().html(this.icon.selected);
            this.selectFreeIdGroup = id.split(',');
            cb && cb();
        }

        /**
         * 取消收藏操作
         * @param {object} params - 事件e，收藏id，市场名，回调
         */

    }, {
        key: 'cancelCollect',
        value: function cancelCollect(params) {
            var e = params.e,
                postFreeId = params.postFreeId,
                marketName = params.marketName,
                cb = params.cb;
            var target = e.target;

            var $currency = (0, _jQuery2.default)(target).closest('.J_currency');
            (0, _jQuery2.default)(target).parent().html(this.icon.unselected);
            this.selectFreeIdGroup = postFreeId.split(',');
            marketName.toLowerCase() === 'optional' && $currency.remove();
            cb && cb();
        }

        /**
         * 关键词搜索过滤事件
         * @param e
         */

    }, {
        key: 'searchEvent',
        value: function searchEvent(e) {
            e.stopPropagation();
            var target = e.target;

            var index = (0, _jQuery2.default)(target).closest('.J_tab-content').index();
            this.tabHandler(index);
        }

        /**
         * 排序事件
         * @param e
         */

    }, {
        key: 'sortEvent',
        value: function sortEvent(e) {
            e.stopPropagation();
            var target = e.target;

            var index = (0, _jQuery2.default)(target).closest('.J_tab-content').index();
            var oldSortType = this.sortType;

            this.sortType = (0, _jQuery2.default)(target).data('type');

            if (!this.sortType) return;
            if (this.sortType === oldSortType) {
                this.sequence = this.sequence === 'ascend' ? 'descend' : 'ascend';
            }
            this.tabHandler(index);
        }
    }]);

    return CoinSelect;
}((0, _base3.default)(config));

exports.default = CoinSelect;
/**
 * Created by loiuslv on 2018/4/18.
 */
