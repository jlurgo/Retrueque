import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import classnames from 'classnames';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import { _ } from 'meteor/underscore';

import { NChanges } from "../shared/collections";

import Typography from '@material-ui/core/Typography';

import NChangeInList from './NChangeInList';
import NChangerAvatar from './NChangerAvatar';
import AddNChangerButton from './AddNChangerButton';
import ItemList from './ItemList';
import NChangeActivity from './NChangeActivity';

const styles = {
  root: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column'
  },
  detailBar: {

  },
  bottomSection: {
    flex: '1 1 auto',
    height: '100px',
    display: 'flex',
    backgroundColor: 'white'
  },
  historySection: {
    flex: '1 1 50%',
    display: 'flex',
    flexDirection: 'column',
  },
  historyTitle: {
    textAlign: 'center',
    backgroundColor: '#41b53f',
    color: 'white',
    flex: '0 0 auto',
  },
  thingsSection: {
    flex: '1 1 50%',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  nChangers: {
    flex: '0 0 auto',
    display: 'flex',
    paddingLeft: '15px',
    alignItems: 'center',
    borderBottom: '2px black dashed'
  },
  nChangersList: {
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'center',
  },
  addNchangerButton: {
    flex: '0 0 auto',
    marginRight: '10px'
  },
  nThings: {
    flex: '1 1 auto'
  },
};

//
class NChangeDetail extends Component {

  handleOnItemClick = (item) => {
    const { nchange } = this.props;
    if(item.owner == Meteor.userId()) {
      return;
    }
    const taken_by_me = _.findWhere(nchange.detail, {
      user: Meteor.userId(), nThing: item._id, action: 'take'
    });

    taken_by_me ? Meteor.call('nchanges.releaseItem', nchange._id, item._id) :
      Meteor.call('nchanges.takeItem', nchange._id, item._id);
  }

  addNChanger = (nchanger_mail) => {
    const { nchange } = this.props;
    Meteor.call('nchanges.add_nchanger', nchange._id, nchanger_mail,
      (err, res) => {
        if (err) alert('nChanger no encontrado');
      });
  }

  render() {
    const { nchange, loading, classes, history } = this.props;

    if (loading) return <div>Loading...</div>

    return (
      <div className={classes.root }>
        <NChangeInList
          key={nchange._id}
          nchange={nchange}
        />
        <div className={classes.bottomSection}>
          <div className={classes.historySection}>
            <Typography noWrap variant="h6" className={classes.historyTitle}>
              Actividad
            </Typography>
            <NChangeActivity activity={nchange.activity}/>
          </div>
          <div className={classes.thingsSection}>
            <div className={classes.nChangers}>
              <div className={classes.nChangersList}>
              {
                nchange.nChangers.map(this.renderNChanger)
              }
              </div>
              <AddNChangerButton classes={{ root: classes.addNchangerButton}}
                onSelect={this.addNChanger}/>
            </div>
            <div className={classes.nThings}>
              <ItemList filter={{owner: { $in: nchange.nChangers }}}
                onItemClick={this.handleOnItemClick}
                classes={{root: classes.listRoot}}/>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderNChanger = (n_changer_id) => {
    const { nchange } = this.props;
    const approved_by_user = !!_.findWhere(nchange.detail,
      { action: 'approve', user: n_changer_id});
    return (
      <NChangerAvatar nChangerId={n_changer_id} key={n_changer_id}
        thumbsUp={approved_by_user}/>
    );
  }
}

export default withRouter(withTracker((props) => {
  const nchange_id = props.match.params.id;
  const nchange_sub = Meteor.subscribe('nchange_detail', nchange_id);
  if (!nchange_sub.ready()) return { loading: true };
  const n_change = NChanges.findOne({_id: nchange_id});
  return {
    nchange: n_change
  };
})
(withStyles(styles)(NChangeDetail)));
