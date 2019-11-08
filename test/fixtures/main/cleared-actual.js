import React, {Component} from 'react';
import {defineMessages, FormattedMessage} from 'react-intl';

const msgs = defineMessages({
  content: {
    id: 'foo.bar.biff',
    defaultMessage: 'Hello Nurse!',
    description: 'Another message',
  },
});

export default class Foo extends Component {
  render() {
    return <div>
      <p><FormattedMessage {...msgs.content}/></p>
    </div>
  }
}
