import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom'
import { _ } from 'meteor/underscore';

import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined';
import StarsIcon from '@material-ui/icons/Stars';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';
import ItemInChange from './ItemInChange';
import NChangerAvatar from './NChangerAvatar';
import NThingIcon from './NThingIcon';

import { Items } from "../shared/collections";

const styles = {
  root: {
    display: 'flex',
    flex: '0 0 auto',
    height: '120px',
    alignItems: 'center',
    margin: '5px',
    cursor: 'pointer'
  },
  itemList: {
    flex: '1 1 100px',
    display: 'flex',
    position: 'relative',
    justifyContent: 'flex-end'
  },
  listOnTheRight: {
    justifyContent: 'flex-start'
  },
  okButton: {
    flex: '0 0 auto',
    backgroundColor: '#e7e7e7',
  },
  approvedOkButton: {
    color: '#41b53f',
  },
  finishedOkButton : {
    color: 'orange'
  }
};


// Item component - represents a single todo item
class NChangeInList extends Component {

  approveNchange = (e) => {
    Meteor.call('nchanges.approve', this.props.nchange._id);
    e.stopPropagation();
  }

  dontApproveNchange = (e) => {
    Meteor.call('nchanges.dont_approve', this.props.nchange._id);
    e.stopPropagation();
  }

  renderItems(items) {
    return items.map((item) => {
      return (
        <ItemInChange
          key={item.nThing}
          itemInChange={item}
        />
      );
    });
  }

  renderOkButton = () => {
    const { nchange, classes } = this.props;

    if (nchange.approved)
      return (
        <IconButton className={classes.okButton + ' ' + classes.finishedOkButton}>
            <StarsIcon fontSize='large'/>
        </IconButton>
      )

    const approved_by_me = !!_.findWhere(nchange.detail,
      { action: 'approve', user: Meteor.userId()});
    if (approved_by_me)
      return (
        <IconButton className={classes.okButton + ' ' + classes.approvedOkButton}
          onClick={this.dontApproveNchange}>
            <ThumbUpIcon fontSize='large'/>
        </IconButton>
      )
    return (
      <IconButton className={classes.okButton}
        onClick={this.approveNchange}>
          <ThumbUpOutlinedIcon fontSize='large'/>
      </IconButton>
    )
  }

  render() {
    const { nchange, classes, history } = this.props;

    const user_input_items = _.where(nchange.detail,
      { action: 'take', user: Meteor.userId()});

    const user_output_items = _.where(nchange.detail,
      { action: 'take', from: Meteor.userId()});

    return (
      <Paper className={classes.root} onClick={()=>{
          history.push(`/nchangedetail/${nchange._id}`)
        }} >
          <div className={classes.itemList}>
            { this.renderItems(user_output_items) }
          </div>
          <ArrowForwardIcon fontSize='large'/>
          { this.renderOkButton() }
          <ArrowBackIcon fontSize='large'/>
          <div className={classes.itemList + ' ' + classes.listOnTheRight} >
            { this.renderItems(user_input_items) }
          </div>
      </Paper>
    );
  }
}

export default withTracker((props) => {
  return { props };
})(withStyles(styles)(withRouter(NChangeInList)));
