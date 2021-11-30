<template>
  <v-container fill-height>
    <v-row align='center' justify='center'>
      <v-col cols='12' sm='8' md='6' lg='4' class='text-center'>
        <v-card class='py-8' elevation='4'>
          <div class='text-h4 pb-2'>欢迎注册</div>
          <v-form ref='form' v-model='valid' lazy-validation>
            <v-alert
              class='my-4'
              transition='slide-y-transition'
              :type='alertType'
              :value='isAlert'
            >
              {{ alertMsg }}
            </v-alert>
            <div class='pl-7 pr-10'>
              <v-text-field
                v-model='email'
                label='edu邮箱'
                prepend-icon='mdi-email'
                :error-messages="errorMsg['email']"
                :clearable='!valid'
                :counter='32'
                :rules='notEmptyRules'
              />
              <v-row
                align='center'
                justify='center'
                style='margin-bottom: -12px'
              >
                <v-col cols='6' sm='8'>
                  <v-text-field
                    v-model='code'
                    label='邮件验证码'
                    prepend-icon='mdi-email-check'
                    :error-messages="errorMsg['code']"
                    :clearable='!valid'
                    :counter='6'
                    :rules='codeRules'
                  />
                </v-col>
                <v-col cols='6' sm='4'>
                  <v-btn
                    color='primary'
                    block
                    :disabled='!sendValid'
                    @click='sendCode'
                  >
                    {{ sendButton }}
                  </v-btn>
                </v-col>
              </v-row>

              <v-text-field
                v-model='password'
                label='密码'
                type='password'
                prepend-icon='mdi-lock'
                :clearable='!valid'
                :counter='32'
                :rules='passwordRules'
              />

              <v-text-field
                v-model='password2'
                label='重复密码'
                type='password'
                prepend-icon='mdi-lock'
                :error-messages="errorMsg['password']"
                :clearable='!valid'
                :counter='32'
                :rules='passwordRules'
              />
              <v-row
                align='center'
                justify='center'
                style='margin-bottom: -12px'
              >
                <v-checkbox v-model='agreelicenses' label='同意'></v-checkbox>
                <!--suppress HtmlUnknownAnchorTarget -->
                <a href='/#/license' target='_blank'>相关协议</a>
              </v-row>
            </div>

            <div class='px-10'>
              <v-btn
                class='my-4'
                color='success'
                block
                :disabled='!(agreelicenses && valid)'
                @click='register'
              >注册
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

@Component
export default class Register extends BaseView {
  // 同意协议
  public agreelicenses: boolean = false
  // 表单信息
  public password: string = ''
  public password2: string = ''
  public email: string = ''
  // 发送验证码信息
  public code: string = ''
  public sendButton: string = '发送验证码'
  public sendValid: boolean = true
  // 验证信息
  public valid: boolean = true
  public isAlert: boolean = false
  public alertMsg: string = ''
  public alertType: string = 'info'
  public errorMsg: {
    email: string
    password: string
  } = {
    email: '',
    password: ''
  }

  public notEmptyRules: Array<Function> = [(v: string) => !!v || '内容不能为空']
  // emailRules: [
  //   v => /^([0-9]{11})@fudan\.edu\.cn$/.test(v) || '@fudan.edu.cn'
  // ],
  public codeRules: Array<Function> = [
    (v: string) => !!v || '内容不能为空',
    (v: string) => /^[0-9]{6}$/.test(v) || '验证码格式不对'
  ]

  public passwordRules: Array<Function> = [
    (v: string) => !!v || '内容不能为空',
    (v: string) => v.length <= 32 || '密码不能超过32字符',
    (v: string) => v.length >= 8 || '密码不能少于8字符'
  ]

  public debouncedCheckUsername: Function
  public debouncedCheckEmail: Function
  public debouncedCheckPassword: Function

  @Ref() readonly form: HTMLFormElement

  public checkEmail (): void {
    if (!/^[0-9]{11}@(m\.)?fudan\.edu\.cn$/.test(this.email)) {
      this.errorMsg.email = '@fudan.edu.cn'
    } else {
      this.errorMsg.email = ''
    }
  }

  public checkPassword (): void {
    if (this.password !== this.password2) {
      this.errorMsg.password = '两次输入不一致'
    } else {
      this.errorMsg.password = ''
    }
  }

  public sendCode (): void {
    if (!this.email) {
      this.messageError('用户名与邮箱不能为空')
      return
    }
    this.sendButtonChangeStatus()
    this.messageInfo('验证码已发送, 请检查邮件以继续')
    this.$axios
      .get('/verify/email', {
        params: {
          email: this.email
        }
      })
      .then((response) => {
        if (response.data.message === '邮箱不在白名单内！') {
          this.messageError(response.data.message)
        } else {
          this.messageSuccess(response.data.message)
        }
      })
  }

  public sendButtonChangeStatus (): void {
    this.sendValid = false
    for (let i = 60; i >= 0; i--) {
      setTimeout(() => {
        this.sendButton = i.toString()
        if (this.sendButton === '0') {
          this.sendButton = '发送验证码'
          this.sendValid = true
        }
      }, 1000 * (60 - i))
    }
  }

  public register (): void {
    if (this.form.validate()) {
      this.$axios
        .post('/register', {
          email: this.email,
          password: this.password,
          verification: parseInt(this.code)
        })
        .then((response) => {
          if (response.data.message === '注册成功') {
            // 注册成功后直接跳转到主页面
            this.messageSuccess('注册成功！')
            localStorage.setItem('newcomer', 'true')
            LocalStorageStore.setToken('token ' + response.data.token)
            setTimeout(() => {
              this.$router.replace('/home')
            }, 1000)
          } else {
            this.messageError(response.data.message)
          }
        })
        .catch(() => {
          this.messageError('网络错误')
        })
    }
  }

  @Watch('email')
  emailChanged () {
    this.debouncedCheckEmail()
  }

  @Watch('password2')
  password2Changed () {
    this.debouncedCheckPassword()
  }

  created () {
    this.debouncedCheckEmail = debounce(this.checkEmail, 1000)
    this.debouncedCheckPassword = debounce(this.checkPassword, 500)
  }
}
</script>
