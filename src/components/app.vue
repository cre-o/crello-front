<template>
  <div id="crello-app">
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <router-view class="view"></router-view>
        </div>
      </div>
      <div class="row mt-4" v-if="error">
        <div class="col-sm-12">
          <div class="alert alert-warning" role="alert">
            It looks like some error happened...
            <br>
            Here is what we know about it:
            <div class="mt-2 mb-2">
              <code>{{ error }}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        error: null
      }
    }
  }
</script>
