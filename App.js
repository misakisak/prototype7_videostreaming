//implemented from the following website
//https://docs.agora.io/en/interactive-live-streaming/get-started/get-started-sdk?platform=react-native

import React, {useRef, useState, useEffect} from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Switch,
} from 'react-native';
import {PermissionsAndroid, Platform} from 'react-native';
import {
    ClientRoleType,
    createAgoraRtcEngine,
    IRtcEngine,
    RtcSurfaceView,
    ChannelProfileType,
} from 'react-native-agora';

const appId = 'a9ca2431c4b948e7bd9d3036a841130f';
const channelName = 'abc';
const token = '007eJxTYHC+fDfGvJpF0WT/g1sPzbTtpK4ll/fIT9wRcZlVp3nGyjIFhkTL5EQjE2PDZJMkSxOLVPOkFMsUYwNjs0QLE0NDY4O0flehlIZARoYpBX3MjAwQCOIzMyQmJTMwAADGUx0h';
const uid = 0;

const engine = createAgoraRtcEngine();
engine.initialize({appId: 'a9ca2431c4b948e7bd9d3036a841130f'});

const App = () => {
    // const agoraEngineRef = useRef<IRtcEngine>(); // Agora engine instance
    const [isJoined, setIsJoined] = useState(false); // Indicates if the local user has joined the channel
    const [isHost, setIsHost] = useState(true); // Client role
    const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
    const [message, setMessage] = useState(''); // Message to the user

    const join = async () => {
        if (isJoined) {
            return;
        }
        try {
            // agoraEngineRef.current?.setChannelProfile(
            engine.current?.setChannelProfile(
                ChannelProfileType.ChannelProfileLiveBroadcasting,
            );
            if (isHost) {
                // agoraEngineRef.current?.startPreview();
                // agoraEngineRef.current?.joinChannel(token, channelName, uid, {
                //     clientRoleType: ClientRoleType.ClientRoleBroadcaster});
                engine.current?.startPreview();
                engine.current?.joinChannel(token, channelName, uid, {
                    clientRoleType: ClientRoleType.ClientRoleBroadcaster});
            } else {
                // agoraEngineRef.current?.joinChannel(token, channelName, uid, {
                //     clientRoleType: ClientRoleType.ClientRoleAudience});
                engine.current?.joinChannel(token, channelName, uid, {
                    clientRoleType: ClientRoleType.ClientRoleAudience});
            }
        } catch (e) {
            console.log(e);
        }
    };

    const leave = () => {
        try {
            // agoraEngineRef.current?.leaveChannel();
            engine.current?.leaveChannel();
            setRemoteUid(0);
            setIsJoined(false);
            showMessage('You left the channel');
            // setMessage('You left the channel');
        } catch (e) {
            console.log(e);
        }
    };

    
    useEffect(() => {
        // Initialize Agora engine when the app starts
        setupVideoSDKEngine();
     });
     
     const setupVideoSDKEngine = async () => {
        try {
        // use the helper function to get permissions
        if (Platform.OS === 'android') { await getPermission()};
        // agoraEngineRef.current = createAgoraRtcEngine();
        // const agoraEngine = agoraEngineRef.current;
        engine.current = createAgoraRtcEngine();
        const agoraEngine = engine.current;
        agoraEngine.registerEventHandler({
            onJoinChannelSuccess: () => {
                showMessage('Successfully joined the channel ' + channelName);
                // setMessage('Successfully joined the channel ' + channelName)
                setIsJoined(true);
            },
            onUserJoined: (_connection, Uid) => {
                showMessage('Remote user joined with uid ' + Uid);
                // setMessage('Remote user joined with uid ' + Uid);
                setRemoteUid(Uid);
            },
            onUserOffline: (_connection, Uid) => {
                showMessage('Remote user left the channel. uid: ' + Uid);
                // setMessage('Remote user left the channel. uid: ' + Uid);
                setRemoteUid(0);
            },
        });
        agoraEngine.initialize({
            appId: appId,
            channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
        });
        agoraEngine.enableVideo();
        } catch (e) {
            console.log(e);
        }
     };
     

    return (
        <SafeAreaView style={styles.main}>
            <Text style={styles.head}>
                Agora Interactive Live Streaming Quickstart
            </Text>
            <View style={styles.btnContainer}>
                <Text onPress={join} style={styles.button}>
                    Join
                </Text>
                <Text onPress={leave} style={styles.button}>
                    Leave
                </Text>
            </View>
            <View style={styles.btnContainer}>
                <Text>Audience</Text>
                <Switch
                    onValueChange={switchValue => {
                        setIsHost(switchValue);
                        if (isJoined) {
                        leave();
                        }
                    }}
                    value={isHost}
                />
                <Text>Host</Text>
            </View>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContainer}>
                {isJoined && isHost ? (
                <React.Fragment key={0}>
                    <RtcSurfaceView canvas={{uid: 0}} style={styles.videoView} />
                    <Text>Local user uid: {uid}</Text>
                </React.Fragment>
                ) : (
                    <Text>{isHost ? 'Join a channel' : ''}</Text>
                )}
                {isJoined && !isHost && remoteUid !== 0 ? (
                    <React.Fragment key={remoteUid}>
                        <RtcSurfaceView
                            canvas={{uid: remoteUid}} style={styles.videoView} />
                        <Text>Remote user uid: {remoteUid}</Text>
                    </React.Fragment>
                ) : (
                    <Text>{isJoined && !isHost ? 'Waiting for a remote user to join' : ''}</Text>
                )}
                <Text style={styles.info}>{message}</Text>
            </ScrollView>
        </SafeAreaView>
    );
    

    function showMessage(msg) {
        setMessage(msg);
    }
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 25,
        paddingVertical: 4,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#0055cc',
        margin: 5,
    },
    main: {flex: 1, alignItems: 'center'},
    scroll: {flex: 1, backgroundColor: '#ddeeff', width: '100%'},
    scrollContainer: {alignItems: 'center'},
    videoView: {width: '90%', height: 200},
    btnContainer: {flexDirection: 'row', justifyContent: 'center'},
    head: {fontSize: 20},
    info: {backgroundColor: '#ffffe0', paddingHorizontal: 8, color: '#0000ff'}
});

const getPermission = async () => {
    if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);
    }
};


export default App;
