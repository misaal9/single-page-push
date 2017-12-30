import React from 'react'
import { StyleSheet, View, Picker, TimePickerAndroid, Platform } from 'react-native'
import { Grid, Col, Row } from 'react-native-easy-grid'
import { Container, Body, Title, Header, Content, Button, Text, Item, Input } from 'native-base'
import { Notifications } from 'expo'
import { Font, SecureStore } from 'expo'
import moment from 'moment'
import preciseDiff from './lib/preciseDiff'
import { padStart } from 'lodash'

preciseDiff(moment)

console.disableYellowBox = true

const CONST = {
  LABEL: {
    START: 'Start',
    STOP: 'Stop',
    DEFAULT_NOTIF_MESSAGE: 'Your time(r) is up! ;)',
    DEFAULT_HOURS: '4',
    DEFAULT_MINUTES: '30',
    // TIMER_RUNNING_MSG: 'Timer is running',
    // TIMER_STOPPED_MSG: 'Timer is not running right now',
    APP_TITLE: 'Timer',
    // ENTER_VALID_TIME_MSG: 'Enter a valid time',
    SET_NEW_TIME: 'Click & set time in HH:MM'
  },
  COLORS: {
    BLUE: '#20094E',
    YELLOW: '#FFD000',
    RED: '#EA5A67',
    WHITE: '#ffffff'
  }
}

let clearTimerInterval, startCountDownInterval;

export default class App extends React.Component {
  state = {
    isTimerRunning: false,
    buttonLabel: CONST.LABEL.START,
    originalHrsSetByUser: '',
    originalMinutesSetByUser: '',
    hours: CONST.LABEL.DEFAULT_HOURS,
    minutes: CONST.LABEL.DEFAULT_MINUTES,
    warningErrorMessageToUser: '',
    timerUpMessage: '',
    fontLoaded: false,
    displayTime: '',
    startTime: '',
    endTime: ''
  }

  async componentDidMount () {
    await Font.loadAsync({
      'roboto-medium': require('./assets/fonts/Roboto-Medium.ttf'),
      'permanent-marker': require('./assets/fonts/Permanent-Marker.ttf')
    })
    
    const isTimerRunning = await SecureStore.getItemAsync('isTimerRunning')

    if (isTimerRunning) {
      console.log('resume timer from last time')
      this.startTimer(true)
    } else {
      console.log('no timer data found. start from scratch')
    }

    this.setState({
      fontLoaded: true,
      hours: await SecureStore.getItemAsync('hours') || this.state.hours,
      minutes: await SecureStore.getItemAsync('minutes') || this.state.minutes
    })
  }

  componentWillUnmount () {
    clearInterval(startCountDownInterval)
  }

  async startTimer (isTimerAlreadyRunning = false) {
    const that = this
    const delay = 1000 * 60
    let hours = await SecureStore.getItemAsync('hours')
    let minutes = await SecureStore.getItemAsync('minutes')
    
    // if used for first time, get default values from local device
    if (!hours && !minutes) {
      console.log('get default values for hours, minutes')
      hours = this.state.hours
      minutes = this.state.minutes
    }

    const startTime = moment()
    let endTime = moment(startTime).add(parseInt(hours, 10), 'h').add(parseInt(minutes, 10), 'm')
    console.log(endTime)
    console.log(endTime.format())
    let diffinTime // remaining duration

    if (isTimerAlreadyRunning) {
      console.log('get timer info for resume')
      hours = await SecureStore.getItemAsync('hours')
      minutes = await SecureStore.getItemAsync('minutes')
      endTime = await SecureStore.getItemAsync('endTime') // use stored value only on resume
      endTime = moment(endTime)
      console.log(moment(endTime))
      console.log(endTime)
    }

    this.setState({
      isTimerRunning: true,
      buttonLabel: CONST.LABEL.STOP,
      // originalHrsSetByUser: hours,
      // originalMinutesSetByUser: minutes,
      endTime
    })

    if (!isTimerAlreadyRunning) {
      console.log('save timer details for resume')
      await SecureStore.setItemAsync('isTimerRunning', 'running')
      await SecureStore.setItemAsync('hours', hours.toString())
      await SecureStore.setItemAsync('minutes', minutes.toString())
      await SecureStore.setItemAsync('endTime', moment(endTime).format())
    }

    Notifications.scheduleLocalNotificationAsync({
      title: CONST.LABEL.APP_TITLE,
      body: CONST.LABEL.DEFAULT_NOTIF_MESSAGE
    }, {
      time: new Date(endTime)
    })

    startCountDownInterval = setInterval( () => {
      currentTimeMoment = moment()
      endTimeMoment = moment(endTime)

      if (currentTimeMoment.isSameOrAfter(endTimeMoment)) {
        console.log('stop timer since time is up')
        return this.stopTimer()
      }

      diffinTime = moment.preciseDiff(moment(), moment(endTime), true)
      that.setState({
        hours: diffinTime.hours, minutes: diffinTime.minutes
      })
    }, delay)
  }

  async stopTimer () {
    const { originalHrsSetByUser, originalMinutesSetByUser } = this.state
    console.log(originalHrsSetByUser)
    console.log(originalMinutesSetByUser)
    clearInterval(startCountDownInterval)
    this.setState({
      // hours: originalHrsSetByUser,
      // minutes: originalMinutesSetByUser,
      isTimerRunning: false,
      buttonLabel: CONST.LABEL.START
    })

    // remove timer info, dont remove hours, minutes to use last saved time
    console.log('remove timer details if timer is stopped/ finished')
    await SecureStore.deleteItemAsync('isTimerRunning')
    await SecureStore.deleteItemAsync('endTime')

    return Notifications.cancelAllScheduledNotificationsAsync()
  }

  toggleStartStopTimer () {
    if (this.state.isTimerRunning) {
      return this.stopTimer()
    }

    this.startTimer()
  }

  getNumeric (text) {
    return onlyNumeric = text.replace(/\D/g,'')
  }

  // handleChangeHours (text) {
  //   this.setState({
  //     hours: this.getNumeric(text)
  //   })
  // }

  // handleChangeMinutes (text) {
  //   this.setState({
  //     minutes: this.getNumeric(text)
  //   })
  // }

  // isButtonDisabled () {
  //   const { hours, minutes } = this.state
  //   return hours === '0' && minutes === '0' 
  // }

  showDisplayTime () {
    return `${padStart(this.state.hours, 2, '0')} : ${padStart(this.state.minutes, 2, '0')}`
  }

  showEndTimeInfoLabel () {
    const { hours, minutes } = this.state
    const startTime = moment()
    const endTime = moment(startTime).add(parseInt(hours, 10), 'h').add(parseInt(minutes, 10), 'm')
    return endTime.format('h:mm A')
  }

  renderIosPicker () {
    return (
      <Row style={{ height: 450 }}>
        <Col style={{ justifyContent: 'center' }}>
          <Picker
            itemStyle={{ textAlign: 'right', color: '#fff', fontSize: 40 }}
            selectedValue={this.state.hours}
            onValueChange={(itemValue, itemIndex) => this.setState({hours: itemValue})}>
            <Picker.Item label="00" value="0" />
            <Picker.Item label="01" value="1" />
            <Picker.Item label="02" value="2" />
            <Picker.Item label="03" value="3" />
            <Picker.Item label="04" value="4" />
            <Picker.Item label="05" value="5" />
            <Picker.Item label="06" value="6" />
            <Picker.Item label="07" value="7" />
            <Picker.Item label="08" value="8" />
            <Picker.Item label="09" value="9" />
            <Picker.Item label="10" value="10" />
            <Picker.Item label="11" value="11" />
            <Picker.Item label="12" value="12" />
          </Picker>
        </Col>
        <Col style={{ flex: 1, justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 40 }}> : </Text>
        </Col>
        <Col style={{ justifyContent: 'center' }}>
          <Picker
            itemStyle={{ textAlign: 'left', color: '#fff', fontSize: 40 }}
            selectedValue={this.state.minutes}
            onValueChange={(itemValue, itemIndex) => this.setState({minutes: itemValue})}>
            <Picker.Item label="00" value="0" />
            <Picker.Item label="10" value="10" />
            <Picker.Item label="15" value="15" />
            <Picker.Item label="20" value="20" />
            <Picker.Item label="30" value="30" />
            <Picker.Item label="40" value="40" />
            <Picker.Item label="45" value="45" />
            <Picker.Item label="50" value="50" />
          </Picker>
        </Col>
      </Row>
    )
  }

  renderPickerOrTime () {
    return (
      <View>
        <View style={{ display: this.state.isTimerRunning ? 'none' : 'flex' }}>
          <Grid>
            { Platform.OS === 'ios' ? this.renderIosPicker() : this.renderAndroidTimePicker() }
          </Grid>
        </View>
        <View style={{ display: this.state.isTimerRunning ? 'flex' : 'none' }}>
          <Grid>
            <Row style={{ height: 450}}>
              <Col style={{ justifyContent: 'center', alignItems: 'center' }}>
                <View>
                  <Text style={styles.hourMinutesLabel}> {this.showDisplayTime()} </Text>
                  <Text style={styles.endTimeInfoLabel}> {this.showEndTimeInfoLabel()} </Text>
                </View>
              </Col>
            </Row>
          </Grid>
        </View>
      </View>
    )
  }

  showTimerStatusMessage () {
    return (
      <Text 
        style={{ fontFamily: 'roboto-medium', 
        fontSize: 15, color: this.state.isTimerRunning ? 'green' : 'orange' }}> 
        {this.renderWarningStatusMessageToUser()} 
      </Text>
    )
  }

  renderStartStopButton () {
    return (
      <View style={{ flexDirection: 'column', alignItems: 'center' }}>
        <Text 
          style={{ fontFamily: 'permanent-marker', fontSize: 80, letterSpacing: 5, color: CONST.COLORS.YELLOW }}
          onPress={() => {this.toggleStartStopTimer()}} >
            { this.state.buttonLabel }
          </Text>
      </View>
    )
  }

  async toggleTimePicker () {
    const that = this
    const { hour, minute } = this.state
    try {
      const { action, hour, minute } = await TimePickerAndroid.open({
        hour: parseInt(that.state.hours, 10),
        minute: parseInt(that.state.minutes, 10),
        is24Hour: true
      })
      if (action !== TimePickerAndroid.dismissedAction) {
        that.setState({
          hours: hour,
          minutes: minute
        })
      }
    } finally {
      // nothing
    }
  }

  renderAndroidTimePicker () {
    return (
      <Row style={{ height: 450 }}>
        <Col style={{ justifyContent: 'center' }}>
            <Text 
              style={{ textAlign: 'center', color: '#ffffff', fontFamily: 'roboto-medium', fontSize: 100 }}
              onPress={() => this.toggleTimePicker()}
            >
              { this.showDisplayTime() }
            </Text>
            <Text style={styles.endTimeInfoLabel}> { CONST.LABEL.SET_NEW_TIME } </Text>
        </Col>
      </Row>
    )
  }

  render() {
    if (!this.state.fontLoaded) {
      return (
        <Container>
          <Content contentContainerStyle={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View><Text>Loading...</Text></View>
          </Content>
        </Container>
      )
    }

    return (
      <Container style={{ backgroundColor: CONST.COLORS.BLUE, flexDirection: 'column' }}>
        <Content contentContainerStyle={{ justifyContent: 'space-around', padding: 20 }}>
          { this.renderPickerOrTime() }
          { this.renderStartStopButton() }
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  hourMinutesLabel: {
    fontSize: 100,
    color: CONST.COLORS.WHITE,
    fontFamily: 'roboto-medium'
  },
  endTimeInfoLabel: {
    fontSize: 15,
    fontFamily: 'roboto-medium',
    color: CONST.COLORS.RED,
    textAlign: 'center',
    marginTop: 20
  },
  pickerItemStyle: {
    color: CONST.COLORS.WHITE,
    fontSize: 40
  }
});
