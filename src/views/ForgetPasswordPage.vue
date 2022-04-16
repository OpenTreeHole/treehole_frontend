<template>
  <v-container fill-height>
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        sm="8"
        md="6"
        lg="4"
        class="text-center"
      >
        <v-card
          class="py-8"
          elevation="4"
        >
          <div class="text-h4 pb-2">重置密码</div>
          <v-form
            ref="form"
            v-model="valid"
            lazy-validation
          >
            <v-alert
              class="my-4"
              transition="slide-y-transition"
              :type="alertType"
              :value="isAlert"
            >
              {{ alertMsg }}
            </v-alert>
            <div class="pl-7 pr-10">
              <v-text-field
                v-model="email"
                label="edu邮箱"
                prepend-icon="mdi-email"
                :error-messages="errorMsg['email']"
                :clearable="!valid"
                :counter="32"
                :rules="notEmptyRules"
              />
              <v-row
                align="center"
                justify="center"
                style="margin-bottom: -12px"
              >
                <v-col
                  cols="6"
                  sm="8"
                >
                  <v-text-field
                    v-model="code"
                    label="邮件验证码"
                    prepend-icon="mdi-email-check"
                    :error-messages="errorMsg['code']"
                    :clearable="!valid"
                    :counter="6"
                    :rules="codeRules"
                  />
                </v-col>
                <v-col
                  cols="6"
                  sm="4"
                >
                  <v-btn
                    color="primary"
                    block
                    :disabled="!sendValid"
                    @click="sendCode"
                  >
                    {{ sendButton }}
                  </v-btn>
                </v-col>
              </v-row>

              <v-text-field
                v-model="password"
                label="密码"
                type="password"
                prepend-icon="mdi-lock"
                :clearable="!valid"
                :counter="32"
                :rules="passwordRules"
              />

              <v-text-field
                v-model="password2"
                label="重复密码"
                type="password"
                prepend-icon="mdi-lock"
                :error-messages="errorMsg['password']"
                :clearable="!valid"
                :counter="32"
                :rules="passwordRules"
              />
            </div>

            <div class="px-10">
              <v-btn
                class="my-4"
                color="success"
                block
                :disabled="!valid"
                @click="changepassword"
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

<script lang="ts">
import { Component, Ref, Watch } from 'vue-property-decorator'
import BaseView from '@/mixins/BaseView.vue'
import { debounce, DebouncedFunc } from 'lodash-es'
import { sleep } from '@/utils/utils'
import { changePassword, verifyWithEmail } from '@/apis'

@Component
export default class ForgetPasswordPage extends BaseView {
  // 表单信息
  password = ''
  password2 = ''
  email = ''
  // 发送验证码信息
  code = ''
  sendButton = '发送验证码'
  sendValid = true
  // 验证信息
  valid = true
  isAlert = false
  alertMsg = ''
  alertType = 'info'
  errorMsg = {
    email: '',
    password: ''
  }

  notEmptyRules = [(v: string) => !!v || '内容不能为空']
  codeRules = [(v: string) => !!v || '内容不能为空', (v: string) => /^[0-9]{6}$/.test(v) || '验证码格式不对']

  passwordRules = [(v: string) => !!v || '内容不能为空', (v: string) => v.length <= 32 || '密码不能超过32字符', (v: string) => v.length >= 8 || '密码不能少于8字符']

  debouncedCheckUsername: DebouncedFunc<() => void>
  debouncedCheckEmail: DebouncedFunc<() => void>
  debouncedCheckPassword: DebouncedFunc<() => void>

  @Ref() readonly form: HTMLFormElement

  checkEmail(): void {
    if (!/^[0-9]+@(m\.)?fudan\.edu\.cn$/.test(this.email)) {
      this.errorMsg.email = '复旦学邮'
    } else {
      this.errorMsg.email = ''
    }
  }

  checkPassword(): void {
    if (this.password !== this.password2) {
      this.errorMsg.password = '两次输入不一致'
    } else {
      this.errorMsg.password = ''
    }
  }

  async sendCode() {
    if (!this.email) {
      this.messageError('用户名与邮箱不能为空')
      return
    }
    this.sendButtonChangeStatus()
    this.messageInfo('验证码已发送, 请检查邮件以继续')

    const { message } = await verifyWithEmail(this.email)
    this.messageSuccess(message)
  }

  sendButtonChangeStatus(): void {
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

  async changepassword() {
    if (this.form.validate()) {
      await changePassword(this.password, this.email, this.code)
      this.messageSuccess('重置密码成功！')
      await sleep(1000)
      await this.$router.replace('/division/1')
    }
  }

  @Watch('email')
  emailChanged() {
    this.debouncedCheckEmail()
  }

  @Watch('password2')
  password2Changed() {
    this.debouncedCheckPassword()
  }

  async created() {
    this.debouncedCheckEmail = debounce(this.checkEmail, 1000)
    this.debouncedCheckPassword = debounce(this.checkPassword, 500)
  }

  async mounted() {
    if (this.$route.query.email) {
      this.email = this.$route.query.email as string
    }
  }
}
</script>
