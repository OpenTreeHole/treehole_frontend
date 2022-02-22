<template>
  <v-container fill-height>
    <v-row align='center' justify='center'>
      <v-col cols='12' sm='8' md='6' lg='4' class='text-center'>
        <v-card class='py-8' elevation='4'>
          <div class='text-h4 pb-2'>重置密码</div>
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
            </div>

            <div class='px-10'>
              <v-btn
                class='my-4'
                color='success'
                block
                :disabled='!valid'
                @click='changepassword'
              >
                修改
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
import { sleep } from '@/utils/utils'

@Component
export default class ChangePasswordPage extends BaseView {
  // 表单信息
  public password: string = ''
  public password2: string = ''
  // 发送验证码信息
  public code: string = ''
  public sendButton: string = '发送验证码'
  public sendValid: boolean = true
  // 验证信息
  public valid: boolean = true
  public isAlert: boolean = false
  public alertMsg: string = ''
  public alertType: string = 'info'
  public errorMsg = {
    email: '',
    password: ''
  }

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
  public debouncedCheckPassword: Function

  @Ref() readonly form: HTMLFormElement

  public checkPassword (): void {
    if (this.password !== this.password2) {
      this.errorMsg.password = '两次输入不一致'
    } else {
      this.errorMsg.password = ''
    }
  }

  public async sendCode () {
    this.sendButtonChangeStatus()
    this.messageInfo('验证码已发送, 请检查邮件以继续')
    const response = await this.$axios
      .get('/verify/email', {
        params: {
          email: LocalStorageStore.email
        }
      })

    this.messageSuccess(response.data.message)
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

  public async changepassword () {
    if (this.form.validate()) {
      await this.$axios
        .put('/register', {
          email: LocalStorageStore.email,
          password: this.password,
          verification: parseInt(this.code)
        })
      this.messageSuccess('修改密码成功！')
      await sleep(1000)
      await this.$router.replace('/division/1')
    }
  }

  @Watch('password2')
  password2Changed () {
    this.debouncedCheckPassword()
  }

  created () {
    this.debouncedCheckPassword = debounce(this.checkPassword, 500)
  }
}
</script>