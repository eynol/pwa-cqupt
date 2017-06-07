<template>
  <frame-layout>
    <p slot="title">校内联系电话</p>
    <div slot="body">
      <ul class="phone__list">
        <li class="phone__list-item" v-for="u,index in phonelist">
          <div class="phone">
            <h1 class="phone-name">{{u.name}}</h1>
            <div>{{u.phone}}</div>
          </div>
        </li>
      </ul>
    </div>
  </frame-layout>
</template>
<script>
import FrameLayout from '@/components/UI/FrameLayout'
export default {
  name: 'phoneNumbers',
  components: {
    FrameLayout
  },
  data: function () {
    return {
      phonelist: [
        { name: '校医院', phone: '62460055/62460278' },
        { name: '保卫处', phone: '62461926/62461018' }
      ]
    }
  }
}
</script>

<style>
.phone__list {
  list-style: none;
  padding: 0;
}

.phone__list:after {
  content: "";
  display: table;
  clear: both;
}

.phone {
  cursor: pointer;
  margin: 10px 30px;
  text-align: center;
  padding: 26px 40px;
  border-radius: 4px;
  background-color: #8a7676;
  color: white;
  box-shadow: 0 1px 10px 0px rgba(0, 0, 0, 0.23);
  overflow: hidden;
  transition: all .3s;
  max-width: 768px;
}
@media screen and (min-width:768px){
  .phone{
    margin:20px auto;
  }
}

.phone:hover {
  will-change: transform;
  transform: translateY(-1px);
  box-shadow: 0 6px 11px 0px rgba(0, 0, 0, 0.23)
}
</style>

