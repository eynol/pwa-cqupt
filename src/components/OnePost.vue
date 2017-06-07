<template>
  <frame-layout>
    <p slot="title">不要浮躁</p>
    <div class="one-post-view" slot="body">
      <p>纽约时间比加州时间早三个小时，</p>
      <p>New York is 3 hours ahead of California,</p>
      <p>但加州时间并没有变慢。</p>
      <p>but it does not make California slow.</p>
      <p>有人22岁就毕业了，</p>
      <p>Someone graduated at the age of 22,</p>
      <p>但等了五年才找到稳定的工作！</p>
      <p>but waited 5 years before securing a good job!</p>
      <p>有人25岁就当上CEO，</p>
      <p>Someone became a CEO at 25,</p>
      <p>却在50岁去世。</p>
      <p>and died at 50.</p>
      <p>也有人迟到50岁才当上CEO，</p>
      <p>While another became a CEO at 50,</p>
      <p>然后活到90岁。</p>
      <p>and lived to 90 years.</p>
      <p>有人单身，</p>
      <p>Someone is still single,</p>
      <p>同时也有人已婚。</p>
      <p>while someone else got married.</p>
      <p>奥巴马55岁就退休，</p>
      <p>Obama retires at 55,</p>
      <p>川普70岁才开始当总统。</p>
      <p>but Trump starts at 70.</p>
      <p>世上每个人本来就有自己的发展时区。</p>
      <p>Absolutely everyone in this world works based on their Time Zone.</p>
      <p>身边有些人看似走在你前面，</p>
      <p>People around you might seem to go ahead of you,</p>
      <p>也有人看似走在你后面。</p>
      <p>some might seem to be behind you.</p>
      <p>但其实每个人在自己的时区有自己的步程。</p>
      <p>But everyone is running their own RACE, in their own TIME.</p>
      <p>不用嫉妒或嘲笑他们。</p>
      <p>Don’t envy them or mock them.</p>
      <p>他们都在自己的时区里，你也是！</p>
      <p>They are in their TIME ZONE, and you are in yours!</p>
      <p>生命就是等待正确的行动时机。</p>
      <p>Life is about waiting for the right moment to act.</p>
      <p>所以，放轻松。</p>
      <p>So, RELAX.</p>
      <p>你没有落后。</p>
      <p>You’re not LATE.</p>
      <p>你没有领先。</p>
      <p>You’re not EARLY.</p>
      <p>在你自己的时区里，一切安排都准时。</p>
      <p>You are very much ON TIME, and in your TIME ZONE.</p>
    </div>
  </frame-layout>
</template>
<script>
import FrameLayout from '@/components/UI/FrameLayout'
export default {
  name: 'onepost',
  components: { FrameLayout }
}
</script>
<style>
.one-post-view {
  max-width: 500px;
  margin: 0px auto;
  padding:20px 20px 60px;
}

.one-post-view>p {
  text-align: left
}
</style>
