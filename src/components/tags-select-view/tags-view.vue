<template>
    <div class="tags_view">
        <div class="tag_box" ref="tagBox">
            <ul class="tag_list" ref="tagList" :style="scrollLeftToStyle">
                <li class="tag_list_item" v-for="(item, index) in visitedViewsGetters" :key="index" @click="linkTo(item)" :ref="`tagItem-${item.path}`">
                    <div :class="['tag_item', isActive(item) ? 'active' : '']">
                        <i class="tag_icon tag_dot"></i>
                        {{ item.name }}
                        <i class="tag_icon tag_close" @click.prevent.stop="closeSelectedTag(item)"></i>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex';
export default {
    name: 'TagsView',
    data() {
        return {
            scrollLeft: 0
        };
    },
    created() {},
    computed: {
        ...mapGetters('tagsView', ['visitedViewsGetters']),
        scrollLeftToStyle() {
            return {
                transform: `translateX(-${this.scrollLeft}px)`
            };
        }
    },
    mounted() {},
    methods: {
        ...mapMutations('tagsView', ['DEL_ROUTE', 'DEL_OTHER_ROUTE']),
        isActive(route) {
            return route.path === this.$route.path;
        },
        closeOtherTag() {
            this.DEL_OTHER_ROUTE({
                path: this.$route.path
            });
        },
        closeSelectedTag({ path }) {
            this.DEL_ROUTE({ path });
            if (this.isActive({ path })) {
                this.$router.push({
                    path: this.visitedViewsGetters[this.visitedViewsGetters.length - 1].path
                });
            }
        },
        linkTo({ path, query }, index) {
            this.$router.push({ path, query });
            this.$nextTick(() => {
                this.moveTo(path);
            });
        },
        //移动tag在标签内
        moveTo(path) {
            const tagItem = this.$refs[`tagItem-${path}`][0];
            const boxWidth = this.$refs.tagBox.offsetWidth;
            const listWidth = this.$refs.tagList.offsetWidth;
            const itemOffsetLeft = tagItem.offsetLeft;
            const itemOffsetWidth = tagItem.offsetWidth;
            if (boxWidth >= listWidth) {
                //标签在视觉内
            } else if (itemOffsetLeft <= this.scrollLeft) {
                //标签左边超出
                this.scrollLeft = itemOffsetLeft;
            } else if (itemOffsetLeft + itemOffsetWidth - this.scrollLeft > boxWidth) {
                //标签右边超出
                this.scrollLeft = itemOffsetLeft + itemOffsetWidth - boxWidth;
            } else {
                //标签未超出
            }
        },
        /**
         * 移动tagItem一段距离
         */
        scrollTo(distance) {
            const boxWidth = this.$refs.tagBox.offsetWidth;
            const listWidth = this.$refs.tagList.offsetWidth;
            if (this.scrollLeft + boxWidth + distance >= listWidth) {
                //如果右移动超出最大值
                this.scrollLeft = listWidth - boxWidth;
            } else if (this.scrollLeft + distance <= 0) {
                //如果左移动超出最小值
                this.scrollLeft = 0;
            } else {
                //如果中间值
                this.scrollLeft = this.scrollLeft + distance;
            }
        },

        /**
         * 移动到指定tag的位置
         */
        moveToTag() {},

        pre() {
            this.scrollTo(-500);
        },
        next() {
            this.scrollTo(500);
        },
        refreshTagPosition() {
            this.$nextTick(() => {
                this.$route.path && this.moveTo(this.$route.path);
            });
        }
    },
    watch: {
        $route: {
            immediate: true,
            deep: true,
            handler(val) {
                this.refreshTagPosition();
            }
        },
        visitedViewsGetters: {
            immediate: true,
            deep: true,
            handler(val) {
                this.refreshTagPosition();
            }
        }
    }
};
</script>

<style scoped>
.tags_view {
    position: relative;
    width: 100%;
    padding: 3px 20px 3px 4px;
    box-sizing: border-box;
    overflow: hidden;
    user-select: none;
    background: #fff;
    box-sizing: border-box;
    height: 38px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
}
.tags_view .tag_box {
    overflow: hidden;
    width: 100%;
}
.tags_view .tag_list {
    transition: transform 0.2s ease;
    display: inline-block;
    white-space: nowrap;
    position: relative;
}
.tags_view .btn {
    background-size: 60%;
    box-sizing: border-box;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    background-repeat: no-repeat;
    background-position: center;
    width: 32px;
    position: absolute;
    content: '';
    display: inline-block;
    z-index: 1;
    height: 100%;
    top: 0px;
    background-color: #fff;
    cursor: pointer;
}
.tags_view .before {
    left: 0;
    background-image: url('./images/left-arrow.png');
}
.tags_view .before:hover {
    background-image: url('./images/left-arrow-active.png');
}
.tags_view .after {
    right: 31px;
    background-image: url('./images/right-arrow.png');
}
.tags_view .close_other {
    right: 0;
    background-image: url('./images/close-other.png');
}
.tags_view .close_other:hover {
    background-image: url('./images/close-other-active.png');
}
.tags_view .after:hover {
    background-image: url('./images/right-arrow-active.png');
}
.tags_view .tag_list .tag_list_item {
    display: inline-block;
    padding-left: 10px;
}
.tags_view .tag_list .tag_list_item .tag_item.active {
    background-color: #42b983;
    color: #fff;
    border-color: #42b983;
}
.tags_view .tag_list .tag_list_item .tag_item.active .tag_icon {
    background: url('./images/newclose.png') no-repeat center;
    border-radius: 50%;
    text-align: center;
    position: relative;
    cursor: pointer;
    font-size: 12px;
    height: 18px;
    width: 18px;
    line-height: 18px;
    top: -2px;
    display: inline-block;
    background-size: 50%;
    vertical-align: middle;
    opacity: 1;
}
.tags_view .tag_list .tag_list_item .tag_item {
    cursor: pointer;
    position: relative;
    height: 26px;
    line-height: 26px;
    border: 1px solid #d8dce5;
    color: #495060;
    background: #fff;
    padding: 0 3px 0 8px;
    font-size: 12px;
    margin-left: 5px;
    margin-top: 4px;
}
.tags_view .tag_list .tag_list_item .tag_item:hover {
    opacity: 0.85;
}
.tags_view .tag_list .tag_list_item .tag_item .tag_icon.tag_dot {
    border-radius: 50%;
    width: 9px;
    height: 9px;
    background: #e8eaec;
    margin-right: 4px;
}
.tags_view .tag_list .tag_list_item .tag_item.active .tag_icon.tag_dot {
    background-color: #fff;
    opacity: 1;
}

.tags_view .tag_list .tag_list_item .tag_item .tag_icon {
    border-radius: 50%;
    text-align: center;
    position: relative;
    cursor: pointer;
    font-size: 12px;
    height: 18px;
    width: 18px;
    line-height: 18px;
    top: -2px;
    display: inline-block;
    background: url('./images/close.png') no-repeat center;
    background-size: 50%;
    vertical-align: middle;
    opacity: 0.6;
}

.tags_view .tag_list .tag_list_item .tag_item .tag_icon:hover {
    opacity: 1;
}
</style>
