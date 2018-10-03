<template>
  <div class="b-boards">
    <div class="row">
      <div class="col-sm-12">
        <div class="jumbotron">
          <h1 class="display-4">Welcome to <span>C<span>r</span><span>e</span><span>l</span><span>l</span><span>o</span></span>! <br> The one and the only boards manager!<sup>*</sup></h1>
          <hr class="my-4">
          <p>*It can be slightly minimal</p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-12">
        <h2 class="mb-4">Public boards <small>(hint) <i class="far fa-hand-point-right"></i> private boards are available only through the unique URLs</small></h2>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-6" v-for="board in boards">
        <div class="card bg-light">
          <div class="card-body">
            <h3 class="card-title mb-4">{{ board.name }}</h3>
            <router-link :to="{ name: 'board', params: { resourceId: board.resource_id }}" class="btn btn-primary">Step inside</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  // Settings
  import { BACKEND_API_URL } from '../settings'

  export default {
    data () {
      return {
        boards: []
      }
    },
    beforeRouteEnter (to, from, next) {
      Vue.axios.get(`${BACKEND_API_URL}/boards`).then((response) => {
        next(vm => vm.setData(response.data))
      }).catch(function (error) {
        next(vm => vm.setData(null, error))
      })
    },
    beforeRouteUpdate (to, from, next) {
      this.post = null
      Vue.axios.get('http://localhost:3000/boards').then((response) => {
        this.setData(response.data)
        next()
      }).catch(function (error) {
        next(vm => vm.setData(null, error))
        next()
      })
    },
    methods: {
      setData (boards, err = null) {
        if (err) {
          this.$parent.error = err.toString()
        } else {
          this.boards = boards
        }
      }
    }
  }
</script>

