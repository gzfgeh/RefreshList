/**
 * Created by guzhenfu on 17/5/9.
 */

import React, { Component } from 'react';
import {
    FlatList,
    Text,
    ActivityIndicator,
    View,
    Dimensions,
    TouchableHighlight,
    StyleSheet,
    NetInfo} from 'react-native';

import Pullable from './Pullable';

const LoadingState      = 1;    //初始loading页面
const EmptyState        = 2;    //空页面
const ErrorState        = 3;    //加载数据错误
const ListState         = 4;    //正常加载
const MoreState         = 5;    //正在加载更多
const NoMoreState       = 6;    //没有更多了
const NoMoreErrorState  = 7;    //加载更多出错

export default class RefreshList extends Pullable {

    constructor(props) {
        super(props);
        this.getMetrics = this.getMetrics.bind(this);
        this.scrollToOffset = this.scrollToOffset.bind(this);
        this.scrollToEnd = this.scrollToEnd.bind(this);
        this.currentState = LoadingState;
    }

    getMetrics(args) {
        this.scroll.getMetrics(args);
    }

    scrollToOffset(...args) {
        this.scroll.scrollToOffset(...args);
    }

    scrollToEnd(args) {
        this.scroll.scrollToEnd(args);
    }

    /**
     * 对外提供API,设置列表数据
     */
    setData(_data){
        if (_data.length == 0){
            this.currentState = EmptyState;
        }else{
            this.currentState = ListState;
        }
        this.setState({
            data: _data,
        })
    }

    /**
     * 对外提供API, loadMore 调用
     */
    addData(_data){
        if (_data.length == 0){
            this.currentState = NoMoreState;

        }else{
            this.currentState = MoreState;
        }
        this.setState({
            data: this.state.data.concat(_data),
        })
    }

    /**
     * 对外提供API, 加载数据出错
     */
    setError(){
        if(this.state.data == null || this.state.data.length == 0){
            this.currentState = ErrorState;
        }else {
            this.currentState = NoMoreErrorState;
        };
        this.forceUpdate();
    }

    /**
     * 对外提供API, 出错重新加载数据
     */
    reloadData(){
        this.currentState = LoadingState;
        this.props.onPullRelease(this.resolveHandler);
        this.forceUpdate();
    }

    /**
     * 加载loading页面
     * @returns {XML}
     * @private
     */
    _renderLoading() {
        return (
            <View
                style={styles.contain}>
                <ActivityIndicator animating size="large"/>
            </View>
        );
    }

    /**
     * 加载 空页面
     */
    _renderEmpty(){
        return (
            <View style={styles.contain}>
                <TouchableHighlight
                    underlayColor="rgba(34, 26, 38, 0.1)"
                    onPress={()=> this.reloadData()}>
                    <Text>数据为空, 点击重新加载</Text>
                </TouchableHighlight>
            </View>
        )
    }

    /**
     * 加载 出错页
     */
    _renderError(){
        return (
            <View style={styles.contain}>
                <TouchableHighlight
                    underlayColor="rgba(34, 26, 38, 0.1)"
                    onPress={()=> this.reloadData()}>
                    <Text>网络错误, 点击重新加载</Text>
                </TouchableHighlight>
            </View>

        )
    }

    /**
     * 加载列表数据
     * @returns {XML}
     * @private
     */
    _renderList(){
        return (
            <FlatList ref={(c) => {this.scroll = c;}}
                      onScroll={this.onScroll}
                      scrollEnabled={this.state.scrollEnabled}
                      refreshing={false}
                      keyExtractor={(item, index) => {return index}}
                      onEndThreshold={1}
                      data={this.state.data}
                      ListFooterComponent={()=> this._renderFoot()}
                      getItemLayout={(data, index) => (
                      {length: this.props.ItemHeight, offset: this.props.ItemHeight * index, index})}
                      {...this.props} />
        );
    }

    /**
     * 加载更多 UI渲染
     * @returns {XML}
     * @private
     */
    _renderFoot(){
        if (this.currentState === NoMoreState){
            return this.props.renderNoMore || (
                <View
                    style={styles.footer}>
                    <Text>没有更多了</Text>
                </View>
            );
        }else if(this.currentState === NoMoreErrorState){
            return this.props.renderMoreError || (
                    <TouchableHighlight
                        style={styles.footer}
                        underlayColor="rgba(34, 26, 38, 0.1)"
                        onPress={()=> {this.props.onEndReached}}>
                        <Text>网络错误, 点击重新加载</Text>
                    </TouchableHighlight>
                )
        }else if(this.currentState >= ListState){
            return this.props.renderMore || (
                    <View
                        style={{
                            paddingVertical: 10,
                            borderTopWidth: 1,
                            borderColor: "#CED0CE"
                        }}>
                        <ActivityIndicator animating size="large"/>
                    </View>
                );
        }else{
            return null;
        }
    }

    /**
     * 类似 render() 方法,具体在父类里面
     * @returns {*}
     */
    getScrollable() {
        if (this.currentState === LoadingState){
            return this.props.renderLoading || this._renderLoading();
        }else if(this.currentState === EmptyState){
            return this.props.renderEmpty || this._renderEmpty();
        }else if(this.currentState === ErrorState){
            return this.props.renderError || this._renderError();
        }else{
            return this._renderList()
        }
    }


}

const styles = StyleSheet.create({
    contain:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    footer:{
        height: 50,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1,
        borderColor: "#CED0CE"
    }
});