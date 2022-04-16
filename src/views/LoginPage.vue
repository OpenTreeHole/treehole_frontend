<template>
  <v-container fill-height>
    <v-row align='center' justify='center'>
      <v-col cols='10' sm='8' md='6' lg='4' class='text-center'>
        <v-card class='py-8' elevation='4'>
          <h1>登录</h1>
          <v-form ref='form' v-model='valid' lazy-validation>
            <div class='pl-7 pr-10'>
              <v-text-field
                v-model='email'
                label='edu邮箱'
                prepend-icon='mdi-email'
                :clearable='!valid'
                :counter='32'
                :error-messages='errorMsg.email'
                :rules='notEmptyRules'
              />

              <v-text-field
                v-model='password'
                label='密码'
                prepend-icon='mdi-lock'
                type='password'
                :clearable='!valid'
                :counter='32'
                :rules='passwordRules'
                @keydown.enter='login'
              />
            </div>
            <div class='px-10'>
              <v-btn
                class='my-4'
                color='primary'
                block
                :disabled='!valid'
                @click='login'
              >
                登录
              </v-btn>
            </div>

            <div>
              <v-btn text color='primary' href='#/license'>
                登录意味着你同意这些协议
              </v-btn>
            </div>
            <div>
              <v-btn text color='primary' href='#/register'>
                没有账号？点此注册
              </v-btn>
            </div>
            <div>
              <v-btn text color='primary' href='#/forgetpassword'>
                忘记密码
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import { Component, Ref, Watch } from 'vue-property-decorator'
import BaseView from '@/mixins/BaseView.vue'
import LocalStorageStore from '@/store/modules/LocalStorageStore'
import { debounce } from 'lodash-es'
import { login } from '@/apis'

@Component
export default class LoginPage extends BaseView {
  alert = false
  valid = true
  email = ''
  password = ''
  notEmptyRules = [(v: string) => !!v || '内容不能为空']

  passwordRules = [
    (v: string) => !!v || '密码不能为空',
    (v: string) => v.length <= 32 || '密码不能超过32字符',
    (v: string) => v.length >= 8 || v === 'admin' || '密码不能少于8字符'
  ]

  errorMsg = {
    email: ''
  }

  debouncedCheckEmail = debounce(this.checkEmail, 500)

  @Ref() form: HTMLFormElement

  async login () {
    if (this.valid) {
      this.form.validate()
      const { message } = await login(this.email, this.password)
      this.messageSuccess(message)
      LocalStorageStore.setEmail(this.email)

      await this.$router.replace('/division/1')
    }
  }

  checkEmail (): void {
    if (!/^[0-9]+@(m\.)?fudan\.edu\.cn$/.test(this.email) && this.email !== 'admin@opentreehole.org') {
      this.errorMsg.email = '复旦学邮'
    } else {
      this.errorMsg.email = ''
    }
  }

  @Watch('email')
  emailChanged () {
    this.debouncedCheckEmail()
  }
}
</script>
