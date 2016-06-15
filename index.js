const snabbdom = require('snabbdom');
const h = require('snabbdom/h');
const patch = snabbdom.init([
  require('snabbdom/modules/class'),
  require('snabbdom/modules/props'),
  require('snabbdom/modules/style'),
  require('snabbdom/modules/eventlisteners')
]);
const dateFormat = require('dateformat');
const thunk = require('snabbdom/thunk');
const PubSub = require('pubsub-js');


const UPDATE_TIME = 'UPDATE_TIME';

const generateContent = count => {
  let content = [];
  let item = SimpleItem.init();
  for (var i = 0; i < count; i++) {
    content.push({ ...item, id: i });
  }
  return content;
}


var timeListener = setInterval(() => {
  PubSub.publish(UPDATE_TIME, Date.now());
}, 1000);



var App = {};

App.init = () => {
  return {
    items: generateContent(50)
  }
};

App.view = (state, update) => {
  return h('div', [
    h('h2', 'Test nested views with async updates'),
    h('div', state.items.map(item => SimpleItem.view(item, update)))
  ]);
};

App.update = (state, action) => {
  if (action.type === UPDATE_TIME) {
    const updatedItems = state.items.map(item => {
      if (item.id === action.id) {

        return SimpleItem.update(item, action.data);
      }
      return item;
    });
    return { ...state, items: updatedItems };
  }

  return state;
};







var SimpleItem = {};

SimpleItem.init = () => {
  return {
    name: 'Detailed time',
    time: Time.init()
  };
};

SimpleItem.view = (state, update) => {
  return h('div', [
    h('div', state.name),
    h('div', [
      h('div', 'Something here'),
      h('div', 'Also here'),
      h('ul', [
        h('li', state.name),
        h('li', [ Time.view(state.time, action => update({ type: UPDATE_TIME, id: state.id, data: action })) ])
      ])
    ])
  ]);
};

SimpleItem.update = (state, action) => {
  if (action.type === UPDATE_TIME) {
    return { ...state, time: Time.update(state.time, action) };
  }

  return state;
};











var Time = {};

Time.init = () => {
  return {
    format: 'HH:MM:ss',
    interval: 1000,
    timestamp: Date.now()
  };
};

Time.view = (state, update) => {
  // var timeListener = setInterval(() => {
  //   update({ type: UPDATE_TIME, data: { timestamp: Date.now() }});
  // }, state.interval);

  var eventListener = PubSub.subscribe(UPDATE_TIME, (e, data) => {
    update({ type: UPDATE_TIME, data: { timestamp: Date.now() }});
  });

  return h('div', [
    h('div', {
      hook: {
        update: () => PubSub.unsubscribe(eventListener)
      },
    }, state.timestamp)
  ]);
};

Time.update = (state, action) => {
  if (action.type === UPDATE_TIME) {
    return { ...state, timestamp: action.data.timestamp };
  }

  return state;
};






const main = (initState, oldVnode, {view, update}) => {
  const newVnode = view(initState, event => {
    const newState = update(initState, event);
    main(newState, newVnode, {view, update});
  });
  patch(oldVnode, newVnode);
};

main(
  App.init(),
  document.body,
  { view: App.view, update: App.update }
);
