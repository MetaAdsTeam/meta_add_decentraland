import * as utils from '@dcl/ecs-scene-utils'


function create_display(stream: any){
    if (stream.is_image){
        myImageTexture = new Texture(stream.url)

        myMaterial.albedoTexture = myImageTexture

        video_rotation = new Quaternion(360, 1, 360, 1)
    }
    else {
        myVideoClip = new VideoClip(stream.url)

        myVideoTexture = new VideoTexture(myVideoClip)
        myVideoTexture.loop = true
        myMaterial.albedoTexture = myVideoTexture
        
        myVideoTexture.play()
        
        video_rotation = new Quaternion(0, -1, 0, 1)
    }    

    screen = new Entity()
    screen.addComponent(new PlaneShape())
    screen.addComponent(
        new Transform({
            position: video_position,
            scale: video_scale,
            rotation: video_rotation,
        })
    )
    screen.addComponent(myMaterial)
    engine.addEntity(screen)
}


function DateWithoutTimeZone(string_date: string) {
    let date = new Date(string_date)
    if (date == null) return date
    var timestamp = date.getTime() - date.getTimezoneOffset() * 60000
    var correctDate = new Date(timestamp)
    return correctDate
}


async function get_data() {
    let json = await utils.sendRequest(
        'https://metaads.team/tornado/adspot/id/1/stream',
        'GET',
        {
            'Host': 'metaads.team',
            'Connection': 'keep-alive',
            'Cache-Control': 'max-age=0',
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="96", "Yandex";v="22"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.116 YaBrowser/22.1.1.1544 Yowser/2.5 Safari/537.3',
            'Accept': '*/*',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-User': '?1',
            'Sec-Fetch-Dest': 'document',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en;q=1'
        }
    )
    let message = json.msg
    if (message && message == 'There are no stream now'){
        log('Nothing to show at the moment')
    }
    else {
        update_date = DateWithoutTimeZone(json.to_time)
        create_display(json)
    }
}


var myVideoClip: VideoClip
var myVideoTexture: VideoTexture
var myImageTexture: Texture
var myMaterial: Material
var screen: Entity

var video_scale = new Vector3(8, 4.5, 1)
var video_position = new Vector3(15, 1 + video_scale.y / 2, 4 + video_scale.x / 2)
var video_rotation = null

var update_date: any = null

myMaterial = new Material()
myMaterial.roughness = 1
myMaterial.specularIntensity = 0
myMaterial.metallic = 0


let checker = new Entity()
engine.addEntity(checker)
checker.addComponent(
  new utils.Interval(5000, () => {
    var now = new Date();
    if (update_date == null || update_date < now){
        executeTask(async () => {
            await get_data()
        })
    }
  })
)
