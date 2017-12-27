import React from 'react'
import { StyleSheet, View, Picker } from 'react-native'
import { Grid, Col, Row } from 'react-native-easy-grid'
import { Container, Body, Title, Header, Content, Button, Text, Item, Input } from 'native-base'
import { Notifications } from 'expo'
import { Font } from 'expo'
import moment from 'moment'

console.disableYellowBox = true

const CONST = {
  LABEL: {
    START: 'Start',
    STOP: 'Stop',
    DEFAULT_NOTIF_MESSAGE: 'The countdown timer you had set is complete!',
    DEFAULT_HOURS: '4',
    DEFAULT_MINUTES: '30',
    TIMER_RUNNING_MSG: 'Timer is running',
    TIMER_STOPPED_MSG: 'Timer is not running right now',
    APP_TITLE: 'Countdown Timer App',
    ENTER_VALID_TIME_MSG: 'Enter a valid time'
  }
}

let clearTimerInterval;

export default class App extends React.Component {
  state = {
    isTimerRunning: false,
    buttonLabel: CONST.LABEL.START,
    hours: CONST.LABEL.DEFAULT_HOURS,
    minutes: CONST.LABEL.DEFAULT_MINUTES,
    warningErrorMessageToUser: '',
    timerUpMessage: '',
    fontLoaded: false
  }

  async componentDidMount () {
    await Font.loadAsync({
      'roboto-thin': require('./assets/fonts/Roboto-Thin.ttf'),
      'roboto-light': require('./assets/fonts/Roboto-Light.ttf'),
      'roboto-medium': require('./assets/fonts/Roboto-Medium.ttf')
    })
    this.setState({
      fontLoaded: true
    })
  }

  componentWillUnmount () {
    clearInterval(clearTimerInterval)
  }

  // resetWarningErrorMessagesToUser () {
  //   this.setState({
  //     warningErrorMessageToUser: ''
  //   })
  // }

  startTimer () {
    // this.resetWarningErrorMessagesToUser()

    const delay = parseInt(this.state.hours * 60 * 60 * 1000, 10) + parseInt(this.state.minutes * 60 * 1000, 10) // TODO: remove 1000 (not dealing in seconds)

    // if (!delay) {
    //   return this.setState({
    //     warningErrorMessageToUser: CONST.LABEL.ENTER_VALID_TIME_MSG
    //   })
    // }
  
    const startTime = moment()
    const endTime = moment(startTime).add(delay, 'milliseconds')
    // console.log(moment(startTime).format('hh:mm'))
    // console.log(moment(endTime).format('hh:mm'))
    // console.time(moment(endTime).toNow())
    // console.log('asdasd')
    // console.log(new Date())
    // console.log(moment().unix())
    // console.log(moment(endTime).unix())

    const messageToShowOnTimerComplete = this.state.timerUpMessage ? this.state.timerUpMessage : CONST.LABEL.DEFAULT_NOTIF_MESSAGE

    this.setState({
      isTimerRunning: true,
      buttonLabel: CONST.LABEL.STOP
    })

    Notifications.scheduleLocalNotificationAsync({
      title: CONST.LABEL.APP_TITLE,
      body: messageToShowOnTimerComplete
    }, {
      time: moment(endTime).unix() * 1000
    })

    clearTimerInterval = setInterval(() => {
      this.stopTimer()
    }, delay)
  }

  stopTimer () {
    clearInterval(clearTimerInterval)
    this.setState({
      isTimerRunning: false,
      buttonLabel: CONST.LABEL.START
    })

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

  handleChangeHours (text) {
    this.setState({
      hours: this.getNumeric(text)
    })
  }

  handleChangeMinutes (text) {
    this.setState({
      minutes: this.getNumeric(text)
    })
  }

  showRemainingTimeLeft () {
    return `${this.state.hours} : ${this.state.minutes}`
  }

  // renderWarningStatusMessageToUser () {
  //   if (this.state.warningErrorMessageToUser) {
  //     return CONST.LABEL.ENTER_VALID_TIME_MSG
  //   }

  //   return this.state.isTimerRunning ? CONST.LABEL.TIMER_RUNNING_MSG : CONST.LABEL.TIMER_STOPPED_MSG
  // }

  isButtonDisabled () {
    const { hours, minutes } = this.state
    console.log(hours)
    console.log(minutes)
    return hours === '0' && minutes === '0' 
  }

  renderInputForUserMessage () {
    return (
      <Row>
        <Col style={{ height: 50, marginTop: 20, marginBottom: 20}}>
          <Item>
            <Input
              textAlign={'center'}
              style={{ fontFamily: 'roboto-medium', fontSize: 15, height: 300, width: 300 }}
              placeholder="Message to show when time is up!"
              value={this.state.timerUpMessage}
              onChangeText={text => this.setState({timerUpMessage: text})}/>
          </Item>
        </Col>
      </Row>
    )
  }

  renderPickerOrTime () {
    return (
      <View>
        <View style={{ display: this.state.isTimerRunning ? 'none' : 'flex' }}>
          <Grid>
            <Row style={{ height: 450 }}>
              <Col style={{ justifyContent: 'center' }}>
                <Picker
                  selectedValue={this.state.hours}
                  onValueChange={(itemValue, itemIndex) => this.setState({hours: itemValue})}>
                  <Picker.Item label="0" value="0" />
                  <Picker.Item label="1" value="1" />
                  <Picker.Item label="2" value="2" />
                  <Picker.Item label="3" value="3" />
                  <Picker.Item label="4" value="4" />
                  <Picker.Item label="5" value="5" />
                  <Picker.Item label="6" value="6" />
                  <Picker.Item label="7" value="7" />
                  <Picker.Item label="8" value="8" />
                  <Picker.Item label="9" value="9" />
                  <Picker.Item label="10" value="10" />
                  <Picker.Item label="11" value="11" />
                  <Picker.Item label="12" value="12" />
                </Picker>
              </Col>
              <Col style={{ flex: 1, justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 20 }}> : </Text>
              </Col>
              <Col style={{ justifyContent: 'center' }}>
                <Picker
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
            {/* { this.renderInputForUserMessage() } */}
          </Grid>
        </View>
        <View style={{ display: this.state.isTimerRunning ? 'flex' : 'none' }}>
          <Grid>
            <Row style={{ height: 450}}>
              <Col style={{ justifyContent: 'center', alignItems: 'center' }}>
                <View>
                  <Text style={styles.hourMinutesLabel}> {this.showRemainingTimeLeft()} </Text>
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
        <Button 
          full block
          success={!this.state.isTimerRunning}
          danger={this.state.isTimerRunning}
          disabled={this.isButtonDisabled()}
          style={{ marginBottom: 20 }}
          onPress={this.toggleStartStopTimer.bind(this)}
          >
          <Text style={{ fontFamily: 'roboto-medium' }}>{ this.state.buttonLabel }</Text>
        </Button>
        {/* { this.showTimerStatusMessage() } */}
      </View>
    )
  }

  render() {
    if (!this.state.fontLoaded) {
      return (
        <Container>
          <Header style={{ backgroundColor: 'blue' }}>
            <Body>
              <Title>Simple Countdown Timer</Title>
            </Body>
          </Header>
          <Content contentContainerStyle={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View><Text>Loading...</Text></View>
          </Content>
        </Container>
      )
    }

    return (
      <Container>
        <Header>
          <Body>
            <Title style={{ fontFamily: 'roboto-light' }}>Simple Countdown Timer</Title>
          </Body>
        </Header>
        <Content contentContainerStyle={{ flexDirection: 'column', justifyContent: 'space-around', padding: 20 }}>
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
    fontFamily: 'roboto-medium'
  }
});
