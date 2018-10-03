<template>
  <div class="b-board">
    <div class="row">
      <div class="col-sm-12">
        <nav class="navbar navbar-expand-lg navbar-light bg-dark">
          <router-link to="/" class="navbar-brand"><span>C<span>r</span><span>e</span><span>l</span><span>l</span><span>o</span></span></router-link>
        </nav>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"><router-link to="/">Home</router-link></li>
            <li class="breadcrumb-item active" aria-current="page">{{ board.name }}</li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col-md-4 col-sm-6 b-list" v-for="(list, index) in orderedLists" :key="list.id">
        <div class="shadow-lg p-3 mb-5 bg-white rounded">
          <ul class="list-group">
            <li class="list-group-item active">
              <div class="float-left">
                <i class="fas fa-list-ul"></i>
                <input v-show="list.edition" @blur="saveList(list)" @keyup.enter="saveList(list)" type="text" ref="listNameInput" v-model="list.name" :placeholder="list.name" v-bind:class="{'border border-danger': list.error == true}" class="form-control">
                <span v-show="!list.edition" class="list-name">{{ list.name }}</span>
              </div>
              <div class="float-right b-mod">
                <a @click="editResource('list', list)" href="javascript:void(0)" title="edit list"><i class="fas fa-pencil-alt"></i></a>
                <a v-if="list.id" @click="deleteResource('list', list)" href="javascript:void(0)" title="delete list"><i class="fas fa-times"></i></a>
              </div>
            </li>

            <draggable element="div" :data-id="list.id" class="b-drag-list" v-model="list.cards" @end="dragEnd" :options="{group:'cards', dataIdAttr: list.id}">
              <li v-for="card in list.cards" :key="card.id" :data-id="card.id" class="list-group-item">
                <div class="float-left">
                  <input v-show="card.edition" @blur="saveCard(card)" @keyup.enter="saveCard(card)" type="text" v-model="card.name" ref="cardNameInput" :placeholder="card.name" v-bind:class="{'border border-danger': card.error == true}" class="form-control">
                  <span v-show="!card.edition">{{ card.name }}</span>
                </div>
                <div class="float-right b-mod">
                  <a @click="editResource('card', card, $event.target)" href="javascript:void(0)" title="edit card"><i class="fas fa-pencil-alt"></i></a>
                  <a v-if="card.id" @click="deleteResource('card', card, list)" href="javascript:void(0)" title="delete card"><i class="fas fa-times"></i></a>
                </div>
              </li>
            </draggable>
          </ul>
          <button type="button" v-if="list.id" @click="addNewCard(list)" class="btn btn-secondary btn-sm mt-4 btn-block">Add new item</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-12">
        <button type="button" @click="addNewList" class="btn btn-primary btn-lg btn-block">Create new list</button>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import draggable from 'vuedraggable'
  // Settings
  import { BACKEND_API_URL } from '../settings'
  import _ from 'lodash'

  export default {
    components: {
      draggable,
    },
    data () {
      return {
        board: {},
        lists: [],
        cards: [],
        resourceId: this.$route.params.resourceId,
        error: null
      }
    },
    created () {
      this.fetchData()
    },
    watch: {
      '$route': 'fetchData'
    },
    computed: {
      orderedLists: function () {
        return _.orderBy(this.lists, 'position')
      }
    },
    methods: {
      fetchData () {
        Vue.axios.get(`${BACKEND_API_URL}/boards/${this.resourceId}`).then((response) => {
          this.board = response.data.board
          this.lists = response.data.lists

          // Adding new props with states
          _.each(this.lists, (list) => {
            this.$set(list, 'edition', false)
            this.$set(list, 'error', false)

            _.each(list.cards, (card) => {
              this.$set(card, 'edition', false)
              this.$set(card, 'error', false)
            })
          })
        }).catch(function (error) {
          this.$parent.error = error.toString()
        })
      },
      dragEnd (evt) {
        let fromListId = Number.parseInt(evt.from.attributes['data-id'].value)
        let toListId = Number.parseInt(evt.to.attributes['data-id'].value)
        let newPosition = Number.parseInt(evt.newIndex) + 1 // New position
        let cardId = Number.parseInt(evt.item.attributes['data-id'].value)
        let that = this

        // We are ready for update...
        Vue.axios.put(`${BACKEND_API_URL}/boards/${this.board.id}/sort_cards`, { from_list_id: fromListId, to_list_id: toListId, card_id: cardId, new_position: newPosition }).catch(function (error) {
          that.$parent.error = error.toString()
        })
      },
      editResource (resourceType, object) {
        if (resourceType == 'list' || resourceType == 'card') {
          object.edition = true

          let refType = resourceType == 'list' ? this.$refs.listNameInput : this.$refs.cardNameInput

          Vue.nextTick( () => {
            _.each(refType, (ref) => {
              if (ref._value == object.name) {
                return ref.focus()
              }
            })
          })

        } else {
          $parent.error = 'Unexpected resource on edit operation'
        }
      },
      deleteResource (resourceType, object, parent = null) {
        let that = this

        if (resourceType == 'list') {
          Vue.axios.delete(`${BACKEND_API_URL}/boards/${this.board.id}/lists/${object.id}`).then((response) => {
            this.lists = _.reject(this.lists, (o) => { return o.id == object.id })
          }).catch(function (error) {
            that.$parent.error = error.toString()
          })
        } else if (resourceType == 'card') {
          if (parent !== null) {
            Vue.axios.delete(`${BACKEND_API_URL}/boards/${this.board.id}/lists/${parent.id}/cards/${object.id}`).then((response) => {
              parent.cards = _.reject(parent.cards, (o) => { return o.id == object.id })
            }).catch(function (error) {
              that.$parent.error = error.toString()
            })
          } else {
            // for faster deletion we need to know parent list of card while caling deleteResource method
            console.log('You need to specify parent for "deleteResource" method')
          }
        } else {
          $parent.error = 'Unexpected resource on delete operation'
        }
      },
      addNewList () {
        // Update lists positions
        this.lists = _.each(this.lists, (list) => {
          list.position += 1
        })
        // Add new list on first position
        this.lists.push({
          name: 'New list',
          board_id: this.board.id,
          cards: [],
          position: 1,
          edition: true
        })

        Vue.nextTick( () => { // Aiming into new list (+)
          _.each(this.$refs.listNameInput, (ref) => {
            if (ref._value == 'New list') {
              return ref.focus()
            }
          })
        })
      },
      addNewCard (list) {
        let currentMaxInt = list.cards.length > 0 ? _.maxBy(list.cards, 'position').position : 0

        list.cards.push({
          name: 'New card',
          position: currentMaxInt + 1,
          list_id: list.id,
          edition: true
        })

        Vue.nextTick( () => { // Aiming into new card (+)
          _.each(this.$refs.cardNameInput, (ref) => {
            if (ref._value == 'New card') {
              return ref.focus()
            }
          })
        })
      },
      saveList (list) {
        if (list.name.length >= 3) {
          let that = this

          if (!list.hasOwnProperty('id')) { // create
            Vue.axios.post(`${BACKEND_API_URL}/boards/${this.board.id}/lists`, { name: list.name, position: list.position }).then((response) => {
              list.id = response.data.id
              list.edition = false // created succesfully!
              list.error = false
            }).catch(function (error) {
              that.$parent.error = error.toString()
              list.error = true
            })
          } else { // update
            Vue.axios.put(`${BACKEND_API_URL}/boards/${this.board.id}/lists/${list.id}`, { name: list.name, position: list.position }).then((response) => {
              list.edition = false // updated succesfully!
              list.error = false
            }).catch(function (error) {
              that.$parent.error = error.toString()
              list.error = true
            })
          }
        } else {
          list.error = true
        }
      },
      saveCard (card) {
        if (card.name.length >= 3) {
          let that = this

          if (!card.hasOwnProperty('id')) { // create
            Vue.axios.post(`${BACKEND_API_URL}/boards/${this.board.id}/lists/${card.list_id}/cards`, { name: card.name, position: card.position }).then((response) => {
              card.id = response.data.id
              card.edition = false // created succesfully!
              card.error = false
            }).catch(function (error) {
              that.$parent.error = error.toString()
              card.error = true
            })
          } else { // update
            Vue.axios.put(`${BACKEND_API_URL}/boards/${this.board.id}/lists/${card.list_id}/cards/${card.id}`, { name: card.name, position: card.position }).then((response) => {
              card.edition = false // updated succesfully!
              card.error = false
            }).catch(function (error) {
              that.$parent.error = error.toString()
              card.error = true
            })
          }
        } else {
          card.error = true
        }
      }
    }
  }
</script>
