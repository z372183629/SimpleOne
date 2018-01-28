/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import constants from '../Constants';
import Slider from "react-native-slider";

import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    Modal,
    TouchableOpacity,
    NativeModules,
    DeviceEventEmitter
} from 'react-native';
var Login = require('../login/Login');
var Read = require('../read/Read');
let media = NativeModules.MediaPlayer;
let toast = NativeModules.ToastNative;
var {width, height} = constants.ScreenWH;

var MusicControl = React.createClass({

    getDefaultProps() {
        return {
            isVisible: false,
            onCancel: null,
        }
    },

    getInitialState(){
        return{
            isPlay: false,
            duration:0,
            total:0,
        }
    },

    componentDidMount(){
        DeviceEventEmitter.addListener(constants.PLAY_PROGRESS, (reminder) => {
            console.log('当前进度' + reminder.currentPosition);
            console.log('总长度' + reminder.totalDuration);
            if(this.state.total==0){
                this.setState({
                    total:(reminder.totalDuration/1000/60).toFixed(2)
                });
            }
            this.setState({
                duration:parseFloat(reminder.currentPosition/reminder.totalDuration)
            });
        });

        DeviceEventEmitter.addListener(constants.PLAY_STATE, (reminder) => {
            console.log('当前状态' + reminder.state);
            if (reminder.state == constants.STOP_PLAY_MEDIA || reminder.state == constants.PLAY_EXCEPTION || reminder.state == constants.PLAY_COMPLETE) {
                this.setState({
                    isPlay: false,
                });
            }
        });
    },

    componentWillUnmount() {
        DeviceEventEmitter.removeAllListeners(constants.PLAY_PROGRESS);
        DeviceEventEmitter.removeAllListeners(constants.PLAY_STATE);

    },
    render() {
        return (
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={this.props.isVisible}
                onRequestClose={() => {
                    this.props.onCancel()
                    console.log("321");
                }}>
                <View style={styles.container} >
                    <View style={styles.bg}>
                        <Text style={styles.title}> {constants.CURRENT_MUSIC_DATA!=null?constants.CURRENT_MUSIC_DATA.title:''}</Text>
                        <Slider
                            style={{width: width*0.92}}
                            trackStyle={{height:width*0.005}}
                            minimumTrackTintColor={'#3f3f3f'}
                            maximumTrackTintColor={'#b3b3b3'}
                            value={constants.CURRENT_MUSIC_DATA!=null?this.state.duration:0.0001}
                            thumbStyle={{width: width*0.024,
                                height: width*0.024,
                                backgroundColor: '#747474',
                                borderColor: '#2e2d1e',
                                borderWidth: 2,
                                borderRadius: width*0.024,
                            }}
                            onValueChange={value =>
                            {console.log(value)}}
                        />
                        <View style={{width:width,height:width*0.03,marginTop:-width*0.04}}>
                         <Text style={styles.durationtext}>{this.state.total.toString().replace('+','')}</Text>
                        </View>
                        <Text style={styles.singer}> {constants.CURRENT_MUSIC_DATA!=null?constants.CURRENT_MUSIC_DATA.audio_author:''}</Text>
                        <View style={styles.btnsView}>
                            <TouchableOpacity style={ {position: 'absolute', left: width * 0.13}} onPress={() => {}}>
                            <Image source={{uri: 'last_disable'}}
                                   style={[styles.controlBtn,]}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {}}>
                            <Image source={{uri: this.state.isPlay?'player_pause':'player_play'}} style={[styles.controlBtn]}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={{position: 'absolute', right: width * 0.13}} onPress={() => {}}>
                            <Image source={{uri: 'next_disable'}} style={[styles.controlBtn, ]}/>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.bottomBar}>
                            <TouchableOpacity style={{position: 'absolute', left: width * 0.04}} onPress={() => {}}>
                            <Image source={{uri: 'player_all_cycle'}}
                                   style={[styles.bottomBtn, ]}/>
                            </TouchableOpacity>
                            <View style={styles.centerfrom}>
                                <Image source={{uri: 'one_right'}} style={styles.bottomBtn}/>
                                <Text style={styles.fromtext}>来自one一个</Text>
                            </View>
                            <View style={{position: 'absolute', right: width * 0.04, flexDirection: 'row'}}>
                                <TouchableOpacity style={{marginRight: width * 0.05}} onPress={() => {this.pushToLogin()}}>
                                <Image source={{uri: 'music_collection_night'}}
                                       style={[styles.bottomBtn, ]}/>
                                </TouchableOpacity>
                                <TouchableOpacity  onPress={() => {this.pushToRead()}}>
                                <Image source={{uri: 'fm_info'}} style={[styles.bottomBtn,]}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={{flex:1,width:width}} onPress={() => {this.props.onCancel();}}/>
                </View>
            </Modal>
        );
    },



    playMusic() {
        console.log('播放地址'+this.props.data.audio_url);
        if (!constants.CURRENT_MUSIC_DATA.audio_url.toString().contains('http://music.wufazhuce.com/')) {
            // media.start('http://music.wufazhuce.com/lmVsrwGEgqs8pQQE3066e4N_BFD4');
            media.start(constants.CURRENT_MUSIC_DATA.audio_url);
            this.setState({
                isPlay: true
            });
        }else{
            toast.showMsg('很抱歉，此歌曲已在虾米音乐下架，无法播放', toast.SHORT);
        }

    },

    /**
     * 跳转到登录
     * @param url
     */
    pushToLogin() {

        this.props.navigator.push(
            {
                component: Login,
                title: '登录',
                params: {}
            }
        )
        this.props.onCancel();
    },

    /**
     * 跳转到阅读页
     * @param url
     */
    pushToRead() {
        this.props.navigator.push(
            {
                component: Read,
                title: '阅读',
                params: {
                    data: constants.CURRENT_MUSIC_DATA,
                    entry: constants.OneRead
                }
            }
        )
        this.props.onCancel();
    }
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    bg: {
        width: width,
        alignItems: 'center',
        backgroundColor: 'white'
    },
    title: {
        marginTop: width * 0.03,
        color: '#B3B3B3',
        fontSize: width * 0.04,
        width:width*0.8,
        textAlign:'center',
        alignSelf:'center'
    },

    singer: {
        marginTop: width * 0.01,
        color: '#cfcfcf',
        fontSize: width * 0.03,
    },
    btnsView: {
        marginTop: width * 0.05,
        width: width * 0.6,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlBtn: {
        width: width * 0.09,
        height: width * 0.09
    },
    bottomBtn: {
        width: width * 0.06,
        height: width * 0.06
    },
    bottomBar: {
        marginTop: width * 0.06,
        width: width,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: width * 0.05,
    },
    centerfrom: {
        flexDirection: 'row',
        justifyContent:'center',
        alignItems:'center'
    },
    fromtext: {
        color: '#cccccc',
        fontSize: width * 0.03,

    },
    durationtext: {
        color: '#cccccc',
        fontSize: width * 0.026,
        position: 'absolute',
        right: width * 0.04
    }
});

module.exports = MusicControl;