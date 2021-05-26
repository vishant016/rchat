import React, { Component } from "react";
import ReactScrollbleFeed from "react-scrollable-feed";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import firebase from "firebase/app";
import "firebase/database";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";

import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Paper from "@material-ui/core/Paper";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import Toolbar from "@material-ui/core/Toolbar";
import config from "./config";
import { withStyles } from "@material-ui/core/styles";

const useStyles = (theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  root: {
    boxShadow: "none",
  },
});

class App extends Component {
  state = {
    isLoggedIn: false,
    messages: [],
    value: "",
    name: "",
    room: "chatbot",
    database: null,
    timestamp: "",
  };

  client = new W3CWebSocket(
    "ws://chatdjangoapp.herokuapp.com/ws/chatapp/" + this.state.room + "/"
  );

  ampm(e) {
    var a = e;
    console.log(a);

    var hours = a.toLocaleString().split(" ")[4];
    var minutes = a.split(" ")[4].split(":")[1];
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }

  usersubmit = (value) => {
    this.state.database
      .ref()
      .child("chat")
      .orderByChild("user")
      .equalTo(this.state.name)
      .once("value")
      .then((snapshot) => {
        if (snapshot.exists()) {
          let userData = snapshot.val();
          console.log(userData);
          // <Alert severity="info">This is an info alert — check it out!</Alert>;
          // alert("User Exists..");
        } else {
          this.state.database.ref("chat").push({
            user: this.state.name,
          });
        }
      });
    this.state.database
      .ref()
      .child("Messages")
      .orderByChild("timestamp")
      .on("child_added", (snapshot) => {
        this.setState((state) => ({
          messages: [
            ...state.messages,
            snapshot.val(),
            // {
            //   msg: snapshot.message,
            //   name: snapshot.name,
            //   timestamp: snapshot.timestamp,
            // },
          ],
        }));
        console.log(snapshot.val());
      });
    this.setState({ isLoggedIn: true });

    value.preventDefault();
  };

  backClick = (e) => {
    this.setState({ isLoggedIn: false, value: "" });
    e.preventDefault();
  };
  onButtonClicked = (e) => {
    this.state.database.ref("Messages").push({
      name: this.state.name,
      message: this.state.value,
      timestamp: this.state.timestamp,
    });
    this.client.send(
      JSON.stringify({
        type: "message",
        message: this.state.value,
        name: this.state.name,
        timestamp: this.state.timestamp,
      })
    );

    this.setState({ value: "" });

    e.preventDefault();
  };

  componentDidMount() {
    this.client.onopen = () => {
      console.log("WebSocket Client Connected " + this.state.room);
    };

    this.client.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      console.log("got reply! ", dataFromServer.name);
      // if (dataFromServer) {

      // }
    };

    firebase.initializeApp(config);
    this.setState({
      database: firebase.database(),
    });
  }

  render() {
    const { classes } = this.props;
    console.log("render");
    return (
      <Container component="main" maxWidth="xs">
        {this.state.isLoggedIn ? (
          <div style={{ marginTop: 50 }}>
            <AppBar position="static" color="primary">
              <Toolbar>
                <IconButton
                  edge="start"
                  className={classes.menuButton}
                  color="inherit"
                  aria-label="menu"
                  onClick={this.backClick}
                >
                  <ArrowBackIosIcon />
                </IconButton>
                <Typography variant="h6" className={classes.title}>
                  ChatRoom
                </Typography>
                <Button color="inherit">
                  {this.state.room}/{this.state.name}
                </Button>
              </Toolbar>
            </AppBar>

            <Paper
              style={{
                height: 400,
                maxHeight: 500,
                overflow: "auto",
                boxShadow: "none",
              }}
            >
              <ReactScrollbleFeed>
                {this.state.messages.map((message) => (
                  <>
                    <Card className={classes.root}>
                      <CardHeader
                        avatar={
                          <Avatar className={classes.avatar}>
                            {message.name[0]}
                          </Avatar>
                        }
                        title={
                          message.name +
                          +"                 " +
                          message.timestamp.split(" ")[4]
                        }
                        subheader={message.message}
                      />
                    </Card>
                  </>
                ))}
              </ReactScrollbleFeed>
            </Paper>
            <form
              className={classes.form}
              noValidate
              onSubmit={this.onButtonClicked}
            >
              <TextField
                id="outlined-helperText"
                label="Type Your message...."
                variant="outlined"
                value={this.state.value}
                fullWidth
                onChange={(e) => {
                  this.setState({
                    value: e.target.value,
                    timestamp: Date().toLocaleString(),
                  });
                  this.value = this.state.value;
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                Send
              </Button>
            </form>
          </div>
        ) : (
          <div>
            <CssBaseline />
            <div className={classes.paper}>
              <Typography component="h1" variant="h5">
                ChatRooms
              </Typography>
              <form
                className={classes.form}
                noValidate
                onSubmit={this.usersubmit}
              >
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Chatroom Name"
                  name="Chatroom Name"
                  autoFocus
                  value={this.state.room}
                  onChange={(e) => {
                    this.setState({ room: e.target.value });
                    this.value = this.state.room;
                  }}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="Username"
                  label="Username"
                  type="Username"
                  id="Username"
                  value={this.state.name}
                  onChange={(e) => {
                    this.setState({ name: e.target.value });
                    this.value = this.state.name;
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                >
                  Start
                </Button>
                {/* <Grid container>
                  <Grid item xs>
                    <Link href="#" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="#" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid> */}
              </form>
            </div>
          </div>
        )}
      </Container>
    );
  }
}
export default withStyles(useStyles)(App);
