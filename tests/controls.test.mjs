import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextTick } from 'vue';
import TradeControls from '../src/components/market/TradeControls.vue';
import QtyStepper from '../src/components/market/QtyStepper.vue';
import { mount, findAll, textOf, button } from './helpers/render.mjs';

for (const direction of ['buy', 'sell']) {
  test(`${direction} presets, total, submission, changing limits and reset signal stay connected`, async () => {
    const submissions = [];
    const wrapper = mount(TradeControls, {
      direction,
      drugName: 'Weed',
      price: 12,
      max: 25,
      resetSignal: 0,
      onTrade: (qty) => submissions.push(qty),
    });
    const label = direction === 'buy' ? 'Buy' : 'Sell';
    button(wrapper.root, '+10').props.onClick();
    await nextTick();
    assert.equal(textOf(button(wrapper.root, label)), `${label}$132`);
    button(wrapper.root, label).props.onClick();
    assert.deepEqual(submissions, [11]);
    button(wrapper.root, 'MAX').props.onClick();
    await nextTick();
    assert.equal(textOf(button(wrapper.root, label)), `${label}$300`);
    wrapper.props.max = 5;
    await nextTick();
    assert.equal(textOf(button(wrapper.root, label)), `${label}$60`);
    button(wrapper.root, label).props.onClick();
    assert.deepEqual(submissions, [11, 5]);
    wrapper.props.resetSignal++;
    await nextTick();
    const input = findAll(wrapper.root, (target) => target.type === 'input')[0];
    assert.equal(input.props.value, 1);
    assert.equal(input.props['aria-label'], `${label} quantity for Weed`);
    wrapper.props.max = 0;
    await nextTick();
    assert.equal(button(wrapper.root, label).props.disabled, true);
    button(wrapper.root, label).props.onClick();
    assert.deepEqual(submissions, [11, 5]);
    wrapper.unmount();
  });
}

test('quantity input clamps to bounds and floors typed values', async () => {
  const updates = [];
  const wrapper = mount(QtyStepper, {
    modelValue: 1,
    min: 1,
    max: 20,
    'onUpdate:modelValue': (value) => {
      updates.push(value);
      wrapper.props.modelValue = value;
    },
  });
  const input = findAll(wrapper.root, (target) => target.type === 'input')[0];
  for (const value of ['7.8', '100', '-5', 'invalid']) {
    input.props.onInput({ target: { value } });
    await nextTick();
  }
  assert.deepEqual(updates, [7, 20, 1]);
  assert.equal(button(wrapper.root, '−').props.disabled, true);
  button(wrapper.root, '+').props.onClick();
  await nextTick();
  assert.equal(input.props.value, 2);
  wrapper.unmount();
});
